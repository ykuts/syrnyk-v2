import { PrismaClient } from '@prisma/client';
import sendOrderConfirmation from '../utils/emailService.js';

const prisma = new PrismaClient();

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      customer,  // Guest customer information
      deliveryType,
      totalAmount,
      paymentMethod,
      notesClient,
      status,
      paymentStatus,
      items,
      addressDelivery,
      stationDelivery,
      pickupDelivery,
    } = req.body;

    // Checking required fields
    if (!deliveryType || !totalAmount || !items || items.length === 0) {
      return res.status(400).json({ 
        message: "Не заповнені обов'язкові поля замовлення" 
      });
    }

    // For guest orders, validate customer information
    if (!userId && (!customer || !customer.email || !customer.firstName || !customer.lastName)) {
      return res.status(400).json({
        message: 'Для гостьових замовлень потрібна інформація про клієнта'
      });
    }

    // If the delivery type is PICKUP, we check the existence of the store
    if (deliveryType === 'PICKUP') {
      const store = await prisma.store.findUnique({
        where: { id: pickupDelivery.storeId }
      });

      if (!store) {
        return res.status(400).json({
          message: 'Зазначений магазин не знайдено'
        });
      }
    }

    // Basic order data
    const orderData = {
      deliveryType,
      totalAmount,
      paymentMethod,
      notesClient,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: {
        create: items.map(item => ({
          product: {
            connect: { id: item.productId }
          },
          quantity: item.quantity,
          price: item.price
        }))
      }
    };

    // Add user connection if authenticated
    if (userId) {
      orderData.user = {
        connect: { id: userId }
      };
    }

    // Add delivery information based on type
    if (deliveryType === 'ADDRESS' && addressDelivery) {
      orderData.addressDelivery = {
        create: addressDelivery
      };
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

    // Add guest information for guest orders
    if (!userId && customer) {
      orderData.guestInfo = {
        create: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || null
        }
      };
    }


    // Create order with all related data
    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: true
          }
        },
        guestInfo: true,
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


    res.status(201).json({
      message: 'Замовлення успішно створено',
      order,
    });
  } catch (error) {
    console.error('Помилка при створенні замовлення:', error);
    res.status(500).json({
      message: 'Помилка при створенні замовлення',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
    
    // Check that the status is one of the valid OrderStatus values
    if (!['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status }
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

// Update the status of an order
/* export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { orderStatus, adminComments } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { orderStatus, adminComments },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; */

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

// Updating the quantity of goods in the order
export const updateOrderItem = async (req, res) => {
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
    // Checking the existence of a record before updating
    const existingItem = await prisma.orderItem.findUnique({
      where: {
        id: Number(itemId)
      }
    });

    if (!existingItem) {
      console.log('Item not found:', itemId);
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
          items: true,
          user: true,
          address: true
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

// Add items to order
export const addOrderItem = async (req, res) => {
  const { orderId } = req.params;
  const { productId, quantity } = req.body;

  try {
    
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

      // Create a new product in the order
      const newOrderItem = await prisma.orderItem.create({
        data: {
          orderId: Number(orderId),
          productId: Number(productId),
          quantity: Number(quantity),
          price: product.price 
        }
      });

      // We receive all the goods in the order to recalculate the total amount
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: Number(orderId)
        }
      });

      // Recalculate the total order amount
      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      // Updating the total order amount
      const updatedOrder = await prisma.order.update({
        where: {
          id: Number(orderId)
        },
        data: {
          totalAmount: totalAmount.toString()
        },
        include: {
          items: true,
          user: true,
          address: true
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

// Removing a product from an order
export const removeOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
    
    const result = await prisma.$transaction(async (prisma) => {
      // Delete item form order
      await prisma.orderItem.delete({
        where: {
          id: Number(itemId),
          orderId: Number(orderId)
        }
      });

      // We receive the remaining items of the order
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: Number(orderId)
        }
      });

      // Recalculate the total order amount
      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      // Updating the total order amount
      const updatedOrder = await prisma.order.update({
        where: {
          id: Number(orderId)
        },
        data: {
          totalAmount: totalAmount.toString()
        },
        include: {
          items: true,
          user: true,
          address: true
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

