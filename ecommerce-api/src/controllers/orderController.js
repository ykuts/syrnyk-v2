import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  sendOrderStatusUpdate,
  sendModifiedOrderConfirmation,
  sendOrderConfirmationToClient,
  sendNewOrderNotificationToAdmin, 
  sendWelcomeEmail,
} from '../services/emailService.js';

const prisma = new PrismaClient();

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      customer,
      shouldRegister,
      password,
      deliveryType,
      totalAmount,
      paymentMethod,
      notesClient,
      items,
      addressDelivery,
      stationDelivery,
      pickupDelivery,
    } = req.body;

    // Checking required fields
    if (!deliveryType || !totalAmount || !items || items.length === 0) {
      return res.status(400).json({ 
        message: "Required order fields are missing" 
      });
    }

    let orderUserId = userId;
    let registeredUser = null;

    // Handle guest registration if requested
    if (!userId && shouldRegister && password && customer) {
      console.log('Processing registration for guest checkout');
      try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: customer.email }
        });

        if (existingUser) {
          console.log('User with email already exists:', customer.email);
          return res.status(400).json({
            message: 'Email already registered. Please login or use a different email.'
          });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Creating new user with email:', customer.email);
        registeredUser = await prisma.user.create({
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            password: hashedPassword,
          }
        });

        console.log('New user created:', registeredUser.id);
        orderUserId = registeredUser.id;

        // Send welcome email to new user
        try {
          await sendWelcomeEmail(registeredUser);
          console.log('Welcome email sent successfully');
        } catch (emailError) {
          console.error('Welcome email sending failed:', emailError);
        }
      } catch (regError) {
        console.error('Registration error:', regError);
        return res.status(400).json({
          message: 'Failed to create user account',
          error: process.env.NODE_ENV === 'development' ? regError.message : undefined
        });
      }
    }

    // Basic order data preparation
    const orderData = {
      deliveryType,
      totalAmount,
      paymentMethod,
      notesClient,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: {
        create: items.map(item => ({
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          price: item.price
        }))
      }
    };

    // Add user connection if we have a user ID
    if (orderUserId) {
      orderData.user = {
        connect: { id: orderUserId }
      };
    } else if (customer) {
      // Add guest information if no user ID
      orderData.guestInfo = {
        create: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || null
        }
      };
    }

    // Add delivery information based on type
    if (deliveryType === 'ADDRESS' && addressDelivery) {
      orderData.addressDelivery = { create: addressDelivery };
    } else if (deliveryType === 'RAILWAY_STATION' && stationDelivery) {
      orderData.stationDelivery = {
        create: {
          stationId: stationDelivery.stationId,
          meetingTime: new Date(stationDelivery.meetingTime)
        }
      };
    } else if (deliveryType === 'PICKUP' && pickupDelivery) {
      orderData.pickupDelivery = {
        create: {
          storeId: pickupDelivery.storeId,
          pickupTime: new Date(pickupDelivery.pickupTime)
        }
      };
    }

    // Create order with all related data
    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: { product: true }
        },
        guestInfo: true,
        user: true,
        addressDelivery: true,
        stationDelivery: {
          include: { station: true }
        },
        pickupDelivery: {
          include: { store: true }
        }
      }
    });

    // Send notifications
    try {
      const recipient = order.user || order.guestInfo;
      
      // Send order confirmation to customer
      await sendOrderConfirmationToClient(order, recipient);
      
      // Send notification to admin
      await sendNewOrderNotificationToAdmin(order, recipient);
    } catch (emailError) {
      console.error('Error sending order notifications:', emailError);
    }

    const responseData = {
      message: 'Order created successfully',
      order,
      user: registeredUser ? {
        id: registeredUser.id,
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName
      } : null
    };
    
    console.log('Sending response with data:', JSON.stringify(responseData, null, 2));
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all orders for a user
export const getOrders = async (req, res) => {
  const { userId } = req.user;

  try {
    const orders = await prisma.order.findMany({ where: { userId }, include: { orderItems: true } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    // Get complete current order to check for changes
    const currentOrder = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        user: true,
        guestInfo: true,
        items: {
          include: {
            product: true
          }
        },
        addressDelivery: true,
        stationDelivery: {
          include: {
            station: true
          }
        },
        pickupDelivery: {
          include: {
            store: true
          }
        }
      }
    });

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order has been modified (has changes array with items)
    const hasChanges = currentOrder.changes && currentOrder.changes.length > 0;

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status },
      include: {
        user: true,
        guestInfo: true,
        items: {
          include: {
            product: true
          }
        },
        addressDelivery: true,
        stationDelivery: {
          include: {
            station: true
          }
        },
        pickupDelivery: {
          include: {
            store: true
          }
        }
      }
    });

    // Get recipient (user or guest)
    const recipient = updatedOrder.user || updatedOrder.guestInfo;

    try {
      // Send appropriate email based on status and changes
      if (status === 'CONFIRMED' && hasChanges) {
        // If confirming modified order
        await sendModifiedOrderConfirmation(updatedOrder, recipient);
      } else {
        // For all other status changes
        await sendOrderStatusUpdate(updatedOrder, recipient);
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      error: 'Error updating order status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    
    // Check status PaymentStatus
    if (!['PENDING', 'PAID', 'REFUNDED'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { paymentStatus }
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        addressDelivery: true,
        stationDelivery: {
          include: {
            station: true
          }
        },
        pickupDelivery: {
          include: {
            store: true
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderNotes = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notesAdmin } = req.body;
    
    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { notesAdmin }
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update order items
export const updateOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Update order item
      const updatedItem = await prisma.orderItem.update({
        where: { id: Number(itemId) },
        data: { quantity: Number(quantity) }
      });

      // Recalculate total amount
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: Number(orderId) }
      });

      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      // Update order with new total and add change log
      const updatedOrder = await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          totalAmount: totalAmount.toString(),
          changes: {
            push: `${new Date().toISOString()} - Item ${itemId} quantity updated to ${quantity}`
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          guestInfo: true,
          addressDelivery: true,
          stationDelivery: {
            include: {
              station: true
            }
          },
          pickupDelivery: {
            include: {
              store: true
            }
          }
        }
      });

      return updatedOrder;
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(400).json({ error: error.message });
  }
};

// Add new item to order
export const addOrderItem = async (req, res) => {
  const { orderId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Get product info
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Create new order item
      await prisma.orderItem.create({
        data: {
          orderId: Number(orderId),
          productId: Number(productId),
          quantity: Number(quantity),
          price: product.price
        }
      });

      // Update order total and add change log
      const updatedOrder = await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          changes: {
            push: `${new Date().toISOString()} - Added product ${product.name} (x${quantity})`
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          guestInfo: true,
          addressDelivery: true,
          stationDelivery: {
            include: {
              station: true
            }
          },
          pickupDelivery: {
            include: {
              store: true
            }
          }
        }
      });

      return updatedOrder;
    });

    res.json(result);
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(400).json({ error: error.message });
  }
};

// Remove item from order
export const removeOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Get item details before deletion
      const item = await prisma.orderItem.findUnique({
        where: { id: Number(itemId) },
        include: { product: true }
      });

      // Delete item
      await prisma.orderItem.delete({
        where: { id: Number(itemId) }
      });

      // Update order total and add change log
      const updatedOrder = await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          changes: {
            push: `${new Date().toISOString()} - Removed product ${item.product.name}`
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          guestInfo: true,
          addressDelivery: true,
          stationDelivery: {
            include: {
              station: true
            }
          },
          pickupDelivery: {
            include: {
              store: true
            }
          }
        }
      });

      return updatedOrder;
    });

    res.json(result);
  } catch (error) {
    console.error('Error removing order item:', error);
    res.status(400).json({ error: error.message });
  }
};

// Notify customer about changes
export const notifyOrderChanges = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;
    
    // Get order with all related data
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        user: true,
        guestInfo: true,
        items: {
          include: {
            product: true
          }
        },
        addressDelivery: true,
        stationDelivery: {
          include: {
            station: true
          }
        },
        pickupDelivery: {
          include: {
            store: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const recipient = order.user || order.guestInfo;
    
    // Send notification email
    await sendOrderStatusUpdate(order, recipient, {
      customMessage: message
    });

    // Update notification timestamp
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        lastNotificationSent: new Date(),
        changes: {
          push: `${new Date().toISOString()} - Notification sent to customer`
        }
      }
    });

    res.json({
      message: 'Notification sent successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      message: 'Error sending notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* export const updateOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;

  console.log(`Updating order item:`, {
    orderId,
    itemId,
    quantity,
    params: req.params,
    body: req.body
  });

  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if item exists and belongs to the order
    const existingItem = await prisma.orderItem.findFirst({
      where: {
        id: Number(itemId),
        orderId: Number(orderId)
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const updatedItem = await prisma.orderItem.update({
        where: {
          id: Number(itemId)
        },
        data: {
          quantity: Number(quantity)
        }
      });

      console.log('Item updated successfully:', updatedItem);

      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: Number(orderId)
        }
      });

      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      const updatedOrder = await prisma.order.update({
        where: {
          id: Number(orderId)
        },
        data: {
          totalAmount: totalAmount.toString()
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          guestInfo: true,
          addressDelivery: true,
          stationDelivery: {
            include: {
              station: true
            }
          },
          pickupDelivery: {
            include: {
              store: true
            }
          }
        }
      });

      return updatedOrder;
    });

    console.log('Order updated successfully:', result);
    res.json(result);
  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(400).json({ error: error.message });
  }
};

export const addOrderItem = async (req, res) => {
  const { orderId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Get product info
      const product = await prisma.product.findUnique({
        where: {
          id: Number(productId)
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if product already exists in order
      const existingItem = await prisma.orderItem.findFirst({
        where: {
          orderId: Number(orderId),
          productId: Number(productId)
        }
      });

      if (existingItem) {
        // Update quantity instead of creating new item
        await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + Number(quantity)
          }
        });
      } else {
        // Create new order item
        await prisma.orderItem.create({
          data: {
            orderId: Number(orderId),
            productId: Number(productId),
            quantity: Number(quantity),
            price: product.price
          }
        });
      }

      // Get all order items and recalculate total
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: Number(orderId)
        }
      });

      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      // Update order with new total
      const updatedOrder = await prisma.order.update({
        where: {
          id: Number(orderId)
        },
        data: {
          totalAmount: totalAmount.toString()
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          guestInfo: true,
          addressDelivery: true,
          stationDelivery: {
            include: {
              station: true
            }
          },
          pickupDelivery: {
            include: {
              store: true
            }
          }
        }
      });

      return updatedOrder;
    });

    res.json(result);
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(400).json({ error: error.message });
  }
};

export const removeOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if item exists and belongs to the order
    const existingItem = await prisma.orderItem.findFirst({
      where: {
        id: Number(itemId),
        orderId: Number(orderId)
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Delete item
      await prisma.orderItem.delete({
        where: {
          id: Number(itemId)
        }
      });

      // Get remaining items and recalculate total
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: Number(orderId)
        }
      });

      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      // Update order with new total
      const updatedOrder = await prisma.order.update({
        where: {
          id: Number(orderId)
        },
        data: {
          totalAmount: totalAmount.toString()
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true,
          guestInfo: true,
          addressDelivery: true,
          stationDelivery: {
            include: {
              station: true
            }
          },
          pickupDelivery: {
            include: {
              store: true
            }
          }
        }
      });

      return updatedOrder;
    });

    res.json(result);
  } catch (error) {
    console.error('Error removing order item:', error);
    res.status(400).json({ error: error.message });
  }
}; */

// Get single order by ID
export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId)
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        guestInfo: true,
        addressDelivery: true,
        stationDelivery: {
          include: {
            station: true
          }
        },
        pickupDelivery: {
          include: {
            store: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
};

