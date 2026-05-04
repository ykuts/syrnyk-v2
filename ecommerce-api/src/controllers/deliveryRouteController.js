// ecommerce-api/src/controllers/deliveryRouteController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get orders for delivery route
 * GET /api/admin/delivery-routes?date=2026-01-24&canton=VD
 */
export const getDeliveryRoutes = async (req, res) => {
  try {
    const { date, canton } = req.query;

    // Validate required parameters
    if (!date) {
      return res.status(400).json({
        error: 'Date parameter is required'
      });
    }

    // Parse date to start and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Build where clause
    const whereClause = {
      deliveryType: 'ADDRESS',
      status: 'CONFIRMED',
      deliveryDate: {
        gte: startOfDay,
        lte: endOfDay
      }
    };

    // Get all orders first
    const allOrders = await prisma.order.findMany({
      where: whereClause,
      include: {
        addressDelivery: true,
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        },
        guestInfo: true
      },
      orderBy: [
        { deliveryOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Filter by canton if provided
    let filteredOrders = allOrders;
    if (canton) {
      filteredOrders = allOrders.filter(order =>
        order.addressDelivery?.canton === canton
      );
    }

    // Calculate summary statistics
    const summary = {
      totalOrders: filteredOrders.length,
      deliveredOrders: filteredOrders.filter(o => o.status === 'DELIVERED').length,
      cashOnDelivery: filteredOrders
        .filter(o => o.paymentStatus === 'PENDING')
        .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
      prepaid: filteredOrders
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
      total: filteredOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)
    };

    // Format orders for response
    const formattedOrders = filteredOrders.map(order => {
      const customer = order.user || order.guestInfo;

      return {
        id: order.id,
        orderNumber: `ORD-${order.id}`,
        deliveryOrder: order.deliveryOrder,
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          email: customer.email,
          address: order.addressDelivery ? {
            street: order.addressDelivery.street,
            house: order.addressDelivery.house,
            apartment: order.addressDelivery.apartment,
            city: order.addressDelivery.city,
            postalCode: order.addressDelivery.postalCode,
            canton: order.addressDelivery.canton,
            fullAddress: `${order.addressDelivery.street} ${order.addressDelivery.house}${order.addressDelivery.apartment ? ', кв. ' + order.addressDelivery.apartment : ''
              }, ${order.addressDelivery.postalCode} ${order.addressDelivery.city}`
          } : null
        },
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: parseFloat(item.price) * item.quantity
        })),
        total: parseFloat(order.totalAmount),
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        status: order.status,
        deliveredAt: order.deliveredAt,
        notesClient: order.notesClient,
        notesAdmin: order.notesAdmin,
        createdAt: order.createdAt
      };
    });

    return res.json({
      date,
      canton: canton || 'ALL',
      summary,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching delivery routes:', error);
    return res.status(500).json({
      error: 'Failed to fetch delivery routes',
      details: error.message
    });
  }
};

/**
 * Get production report - aggregated products for preparation
 * GET /api/admin/production-report?date=2026-01-24&canton=VD&deliveryType=ADDRESS&status=CONFIRMED
 */
export const getProductionReport = async (req, res) => {
  try {
    const { startDate, endDate, canton, deliveryType, status = 'CONFIRMED' } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date parameters are required'
      });
    }

    // Parse dates
    const deliveryStartDate = new Date(startDate);
    deliveryStartDate.setHours(0, 0, 0, 0);

    const deliveryEndDate = new Date(endDate);
    deliveryEndDate.setHours(23, 59, 59, 999);

    // Build where clause
    const whereClause = {
      deliveryDate: {
        gte: deliveryStartDate,
        lte: deliveryEndDate
      }
    };

    // Add status filter
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    // Add delivery type filter
    if (deliveryType && deliveryType !== 'ALL') {
      whereClause.deliveryType = deliveryType;
    }

    // Get all matching orders with items and products
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
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
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        guestInfo: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Filter by canton if provided
    let filteredOrders = orders;
    if (canton && canton !== 'ALL') {
      filteredOrders = orders.filter(order => {
        if (order.deliveryType === 'ADDRESS' && order.addressDelivery) {
          return order.addressDelivery.canton === canton;
        }
        return true; // Include non-address deliveries or those without canton
      });
    }

    // Aggregate products
    const productAggregation = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId;
        const productName = item.product.name;
        const quantity = item.quantity;

        if (!productAggregation[productId]) {
          productAggregation[productId] = {
            id: productId,
            name: productName,
            totalQuantity: 0,
            weight: item.product.weight,
            orders: []
          };
        }

        productAggregation[productId].totalQuantity += quantity;
        productAggregation[productId].orders.push({
          orderId: order.id,
          quantity: quantity
        });
      });
    });

    // Convert to array and sort by name
    const productsArray = Object.values(productAggregation).sort((a, b) =>
      a.name.localeCompare(b.name, 'uk')
    );

    // Create grouping by delivery type if "ALL" types selected
    let productsByDeliveryType = null;
    if (!deliveryType || deliveryType === 'ALL') {
      productsByDeliveryType = {
        ADDRESS: {},
        RAILWAY_STATION: {},
        PICKUP: {}
      };

      filteredOrders.forEach(order => {
        const type = order.deliveryType;

        order.items.forEach(item => {
          const productId = item.productId;
          const productName = item.product.name;
          const quantity = item.quantity;

          if (!productsByDeliveryType[type][productId]) {
            productsByDeliveryType[type][productId] = {
              id: productId,
              name: productName,
              totalQuantity: 0,
              weight: item.product.weight
            };
          }

          productsByDeliveryType[type][productId].totalQuantity += quantity;
        });
      });

      // Convert to arrays
      productsByDeliveryType.ADDRESS = Object.values(productsByDeliveryType.ADDRESS).sort((a, b) => a.name.localeCompare(b.name, 'uk'));
      productsByDeliveryType.RAILWAY_STATION = Object.values(productsByDeliveryType.RAILWAY_STATION).sort((a, b) => a.name.localeCompare(b.name, 'uk'));
      productsByDeliveryType.PICKUP = Object.values(productsByDeliveryType.PICKUP).sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    }


    // Format orders for detail view
    const ordersDetail = filteredOrders.map(order => {
      const customer = order.user || order.guestInfo;

      let deliveryInfo = '';
      if (order.deliveryType === 'ADDRESS' && order.addressDelivery) {
        deliveryInfo = `${order.addressDelivery.city} (${order.addressDelivery.canton})`;
      } else if (order.deliveryType === 'RAILWAY_STATION' && order.stationDelivery) {
        deliveryInfo = `${order.stationDelivery.station.name}`;
      } else if (order.deliveryType === 'PICKUP' && order.pickupDelivery) {
        deliveryInfo = order.pickupDelivery.store.name;
      }

      return {
        id: order.id,
        orderNumber: `ORD-${order.id}`,
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone
        },
        deliveryType: order.deliveryType,
        deliveryInfo: deliveryInfo,
        items: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        total: parseFloat(order.totalAmount),
        paymentStatus: order.paymentStatus,
        status: order.status
      };
    });

    // Calculate summary
    const summary = {
      totalOrders: filteredOrders.length,
      totalProducts: productsArray.reduce((sum, p) => sum + p.totalQuantity, 0),
      totalAmount: filteredOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
      byDeliveryType: {
        ADDRESS: filteredOrders.filter(o => o.deliveryType === 'ADDRESS').length,
        RAILWAY_STATION: filteredOrders.filter(o => o.deliveryType === 'RAILWAY_STATION').length,
        PICKUP: filteredOrders.filter(o => o.deliveryType === 'PICKUP').length
      },
      byCanton: {
        VD: filteredOrders.filter(o => o.deliveryType === 'ADDRESS' && o.addressDelivery?.canton === 'VD').length,
        GE: filteredOrders.filter(o => o.deliveryType === 'ADDRESS' && o.addressDelivery?.canton === 'GE').length
      }
    };

    return res.json({
      startDate,
      endDate,
      filters: {
        canton: canton || 'ALL',
        deliveryType: deliveryType || 'ALL',
        status: status
      },
      summary,
      products: productsArray,
      productsByDeliveryType: productsByDeliveryType, // Add grouped data
      orders: ordersDetail
    });

  } catch (error) {
    console.error('Error generating production report:', error);
    return res.status(500).json({
      error: 'Failed to generate production report',
      details: error.message
    });
  }
};

/**
 * Mark order as delivered
 * PATCH /api/admin/orders/:id/complete-delivery
 */
export const completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    // Check if order exists and is eligible for delivery completion
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        addressDelivery: true,
        user: true,
        guestInfo: true
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        error: `Cannot complete delivery for order with status: ${order.status}`
      });
    }

    // Update order status to DELIVERED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        // If payment was pending (cash on delivery), mark as paid
        paymentStatus: order.paymentStatus === 'PENDING' ? 'PAID' : order.paymentStatus
      },
      include: {
        addressDelivery: true,
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        },
        guestInfo: true
      }
    });

    // Format response
    const customer = updatedOrder.user || updatedOrder.guestInfo;

    return res.json({
      message: 'Order marked as delivered',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        deliveredAt: updatedOrder.deliveredAt,
        paymentStatus: updatedOrder.paymentStatus,
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone
        },
        total: parseFloat(updatedOrder.totalAmount)
      }
    });

  } catch (error) {
    console.error('Error completing delivery:', error);
    return res.status(500).json({
      error: 'Failed to complete delivery',
      details: error.message
    });
  }
};
