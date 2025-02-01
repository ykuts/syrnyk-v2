import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all orders for admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        guestInfo: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
        addressDelivery: true,
        stationDelivery: {
          include: {
            station: true,
          },
        },
        pickupDelivery: {
          include: {
            store: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      message: 'Orders retrieved successfully',
      orders,
    });
  } catch (error) {
    console.error('Admin orders retrieval error:', error);
    res.status(500).json({ 
      message: 'Error retrieving orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notesAdmin } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status,
        notesAdmin,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
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
      },
    });

    // Send email notification
    if (updatedOrder.user) {
      await sendOrderStatusUpdate(updatedOrder, updatedOrder.user);
    } else if (updatedOrder.guestInfo) {
      await sendOrderStatusUpdate(updatedOrder, updatedOrder.guestInfo);
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ 
      message: 'Error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all users for admin
export const getAllUsers = async (req, res) => {
  try {
    console.log('Starting getAllUsers query...');

    await prisma.$connect();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        isActive: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Successfully retrieved ${users.length} users`);

    return res.json({
      message: 'Users retrieved successfully',
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Admin users retrieval error:', error);
    res.status(500).json({ 
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

// Check for specific Prisma errors
if (error.code) {
  console.error('Prisma error code:', error.code);
}

return res.status(500).json({ 
  message: 'Error retrieving users',
  error: process.env.NODE_ENV === 'development' 
    ? {
        message: error.message,
        code: error.code,
        meta: error.meta
      }
    : 'Internal server error'
});
} finally {
// Disconnect prisma client
await prisma.$disconnect();
}

  
};