import { PrismaClient }from '@prisma/client';

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

// Update the status of an order
export const updateOrderStatus = async (req, res) => {
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
};

