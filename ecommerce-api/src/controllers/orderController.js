import { PrismaClient } from '@prisma/client';
import sendOrderConfirmation from '../utils/emailService.js';

const prisma = new PrismaClient();

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      status,
      totalAmount,
      paymentStatus,
      paymentMethod,
      trackingNumber,
      notes,
      items,
    } = req.body;

    // Проверка обязательных полей
    if (!userId || !addressId || !totalAmount || !items || items.length === 0) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля.' });
    }

    // Создание заказа и связанных элементов заказа
    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        status,
        totalAmount,
        paymentStatus,
        paymentMethod,
        trackingNumber,
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await sendOrderConfirmation(order);

    res.status(201).json({
      message: 'Заказ успешно создан',
      order,
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({
      message: 'Ошибка при создании заказа',
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
    
    // Проверяем, что статус является одним из допустимых значений OrderStatus
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
    
    // Проверяем, что статус является одним из допустимых значений PaymentStatus
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
  //const { userId } = req.user;

  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc' // Sort descende. New at the top
      },
      include: {
        items: true,
        user: true,
        address: true
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Обновление количества товара в заказе
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
    // Проверяем существование записи перед обновлением
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

// Добавление товара в заказ
export const addOrderItem = async (req, res) => {
  const { orderId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Начинаем транзакцию
    const result = await prisma.$transaction(async (prisma) => {
      // Получаем информацию о продукте
      const product = await prisma.product.findUnique({
        where: {
          id: Number(productId)
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Создаем новый товар в заказе
      const newOrderItem = await prisma.orderItem.create({
        data: {
          orderId: Number(orderId),
          productId: Number(productId),
          quantity: Number(quantity),
          price: product.price // Используем цену из продукта
        }
      });

      // Получаем все товары заказа для пересчета общей суммы
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: Number(orderId)
        }
      });

      // Пересчитываем общую сумму заказа
      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      // Обновляем общую сумму заказа
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

// Удаление товара из заказа
export const removeOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
    // Начинаем транзакцию
    const result = await prisma.$transaction(async (prisma) => {
      // Удаляем товар из заказа
      await prisma.orderItem.delete({
        where: {
          id: Number(itemId),
          orderId: Number(orderId)
        }
      });

      // Получаем оставшиеся товары заказа
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: Number(orderId)
        }
      });

      // Пересчитываем общую сумму заказа
      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.quantity);
      }, 0);

      // Обновляем общую сумму заказа
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

