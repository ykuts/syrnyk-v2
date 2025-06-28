import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  sendOrderStatusUpdate,
  sendModifiedOrderConfirmation,
  sendOrderConfirmation,
  sendNewOrderAdminEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';

const prisma = new PrismaClient();
// Helper function to prepare time from time slot string
const prepareTimeFromSlot = (dateString, timeSlotString) => {
  if (!timeSlotString || !dateString) return dateString;
  
  try {
    // If time slot is in format "09:00-12:00", extract the start time
    const startTime = timeSlotString.split('-')[0].trim();
    
    // Create a new date object from delivery date
    const date = new Date(dateString);
    
    // Parse time components
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Validate time components
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn('Invalid time slot format:', timeSlotString);
      return dateString;
    }
    
    // Set time components
    date.setHours(hours, minutes, 0, 0);
    
    return date.toISOString();
  } catch (error) {
    console.error('Error preparing time from slot:', error);
    return dateString;
  }
};

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
      notesAdmin,
      items,
      addressDelivery,
      stationDelivery,
      pickupDelivery,
      deliveryDate,
      deliveryTimeSlot,
      deliveryCost = 0,
      userLanguage
    } = req.body;

    // Validate delivery date for all delivery types
    if (!deliveryDate) {
      return res.status(400).json({
        message: "Delivery date is required"
      });
    }

    // Validate delivery date is not in the past
    const selectedDate = new Date(deliveryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      return res.status(400).json({
        message: "Delivery date must be at least one day in advance"
      });
    }

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

        // Extract consent data from request body
        const { dataConsentAccepted, marketingConsent, dataConsentVersion, dataConsentDate } = req.body;

        // Check for data consent - with fallback
        if (!dataConsentAccepted) {
          return res.status(400).json({
            message: 'Data processing consent is required for registration.'
          });
        }

        // Create new user with consent data
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Creating new user with email:', customer.email);
        registeredUser = await prisma.user.create({
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            password: hashedPassword,
            dataConsentAccepted: dataConsentAccepted || false,
            dataConsentDate: dataConsentDate || new Date().toISOString(),
            dataConsentVersion: dataConsentVersion || 'v1.0',
            marketingConsent: marketingConsent || false,
            preferredLanguage: userLanguage || 'uk'
          }
        });

        console.log('New user created:', registeredUser.id);
        orderUserId = registeredUser.id;

        // Send welcome email to new user
        try {
          await sendWelcomeEmail(registeredUser, registeredUser.preferredLanguage|| 'uk');
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
      notesClient: notesClient || '',
      notesAdmin: notesAdmin || '',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      deliveryTimeSlot: deliveryTimeSlot || null,
      deliveryCost: parseFloat(deliveryCost) || 0,
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

    // Add delivery information based on type with proper time handling
    if (deliveryType === 'ADDRESS' && addressDelivery) {
      orderData.addressDelivery = { create: addressDelivery };
    } else if (deliveryType === 'RAILWAY_STATION' && stationDelivery) {
      // For railway station, use delivery date directly
      orderData.stationDelivery = {
        create: {
          stationId: stationDelivery.stationId,
          meetingTime: new Date(deliveryDate) // Use delivery date for meeting time
        }
      };
    } else if (deliveryType === 'PICKUP' && pickupDelivery) {
      // For pickup, combine delivery date and time slot
      const pickupDateTime = prepareTimeFromSlot(deliveryDate, deliveryTimeSlot);
      orderData.pickupDelivery = {
        create: {
          storeId: pickupDelivery.storeId,
          pickupTime: new Date(pickupDateTime)
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
      const recipientLanguage = recipient.preferredLanguage || userLanguage || 'uk';

      // Send order confirmation to customer
      await sendOrderConfirmation(order, recipient, recipientLanguage);

      // Send notification to admin
      await sendNewOrderAdminEmail(order, recipient);
    } catch (emailError) {
      console.error('Error sending order notifications:', emailError);
    }

    // Prepare response data - exclude admin notes from client response
    const clientOrderData = {
      ...order,
      notesAdmin: undefined // Hide admin notes from client response
    };

    const responseData = {
      message: 'Order created successfully',
      order: clientOrderData,
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
    const orders = await prisma.order.findMany({ 
      where: { userId }, 
      select: {
        // Explicitly select fields, excluding notesAdmin
        id: true,
        deliveryType: true,
        totalAmount: true,
        paymentMethod: true,
        notesClient: true,  // Include client notes
        // notesAdmin: false, // Exclude admin notes for client
        status: true,
        paymentStatus: true,
        deliveryDate: true,
        deliveryTimeSlot: true,
        deliveryCost: true,
        createdAt: true,
        updatedAt: true,
        items: {
          include: { product: true }
        },
        addressDelivery: true,
        stationDelivery: {
          include: { station: true }
        },
        pickupDelivery: {
          include: { store: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
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
      const recipientLanguage = recipient.preferredLanguage || 'uk';
      // Send appropriate email based on status and changes
      if (status === 'CONFIRMED' && hasChanges) {
        // If confirming modified order
        await sendModifiedOrderConfirmation(updatedOrder, recipient, recipientLanguage);
      } else {
        // For all other status changes
        await sendOrderStatusUpdate(updatedOrder, recipient, recipientLanguage);
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
      data: { paymentStatus },
      include: {
        items: {
          include: { product: true }
        },
        addressDelivery: true,
        stationDelivery: {
          include: { station: true }
        },
        pickupDelivery: {
          include: { store: true }
        }
      }
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
      data: { notesAdmin },
      include: {
        items: {
          include: { product: true }
        },
        addressDelivery: true,
        stationDelivery: {
          include: { station: true }
        },
        pickupDelivery: {
          include: { store: true }
        }
      }
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update order items with change tracking
export const updateOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Update order item
      const updatedItem = await prisma.orderItem.update({
        where: { id: Number(itemId) },
        data: { quantity: Number(quantity) },
        include: { product: true }
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
            push: `${new Date().toISOString()} - Item ${updatedItem.product.name} quantity updated to ${quantity}`
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
    const recipientLanguage = recipient.preferredLanguage || 'uk'

    // Send notification email
    await sendOrderStatusUpdate(order, recipient, recipientLanguage, message);

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