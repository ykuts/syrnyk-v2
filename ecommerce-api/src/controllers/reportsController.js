import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Get orders data for pivot table analysis
export const getOrdersReportData = async (req, res) => {
  try {
    console.log('📊 Reports Controller - getOrdersReportData called with planning support');
    console.log('Query params:', req.query);

    const { 
      startDate, 
      endDate, 
      status,
      deliveryType,
      // New parameters for delivery date filtering (planning)
      deliveryStartDate,
      deliveryEndDate
    } = req.query;

    // Build where conditions for order creation date
    const whereConditions = {};
    
    // Order creation date filter (historical data)
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        whereConditions.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // Include full end date
        whereConditions.createdAt.lte = endDateTime;
      }
    }

    // Delivery date filter (for planning future deliveries)
    if (deliveryStartDate || deliveryEndDate) {
      whereConditions.deliveryDate = {};
      if (deliveryStartDate) {
        whereConditions.deliveryDate.gte = new Date(deliveryStartDate);
      }
      if (deliveryEndDate) {
        const endDateTime = new Date(deliveryEndDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereConditions.deliveryDate.lte = endDateTime;
      }
    }
    
    // Status filter
    if (status && status !== 'all') {
      whereConditions.status = status;
    }
    
    // Delivery type filter
    if (deliveryType && deliveryType !== 'all') {
      whereConditions.deliveryType = deliveryType;
    }

    console.log('Where conditions:', whereConditions);

    // Fetch orders with all related data
    const orders = await prisma.order.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        guestInfo: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                weight: true,
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { deliveryDate: 'asc' } // Also order by delivery date for planning
      ]
    });

    console.log(`Found ${orders.length} orders`);

    // Transform data for pivot table with planning features
    const reportData = [];
    const currentDate = new Date();

    orders.forEach(order => {
      // Get customer information
      const customerName = order.user 
        ? `${order.user.firstName} ${order.user.lastName}`
        : order.guestInfo 
        ? `${order.guestInfo.firstName} ${order.guestInfo.lastName}`
        : 'Unknown Customer';

      const customerPhone = order.user?.phone || order.guestInfo?.phone || '';
      const customerEmail = order.user?.email || order.guestInfo?.email || '';

      // Get delivery information
      let deliveryLocation = 'Not specified';
      let deliveryCity = 'Not specified';
      let deliveryCanton = 'Not specified';
      let stationName = '';
      let deliveryTypeLabel = '';

      // Parse delivery information based on type
      switch (order.deliveryType) {
        case 'RAILWAY_STATION':
          deliveryTypeLabel = 'ЖД Станція';
          if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
            stationName = order.deliveryAddress.station || '';
            deliveryLocation = stationName;
            deliveryCity = order.deliveryAddress.city || 'Not specified';
            deliveryCanton = order.deliveryAddress.canton || 'Not specified';
          }
          break;
        case 'ADDRESS':
          deliveryTypeLabel = 'Адресна доставка';
          if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
            deliveryLocation = `${order.deliveryAddress.street || ''} ${order.deliveryAddress.house || ''}${order.deliveryAddress.apartment ? `, кв. ${order.deliveryAddress.apartment}` : ''}`.trim();
            deliveryCity = order.deliveryAddress.city || 'Not specified';
            deliveryCanton = order.deliveryAddress.canton || 'Not specified';
          }
          break;
        case 'PICKUP':
          deliveryTypeLabel = 'Самовивіз';
          if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
            deliveryLocation = order.deliveryAddress.location || 'Store pickup';
            deliveryCity = order.deliveryAddress.city || 'Nyon';
            deliveryCanton = order.deliveryAddress.canton || 'VD';
          }
          break;
        default:
          deliveryTypeLabel = order.deliveryType || 'Unknown';
      }

      // Planning-specific calculations
      const isFutureDelivery = order.deliveryDate ? order.deliveryDate > currentDate : false;
      const daysUntilDelivery = order.deliveryDate ? 
        Math.ceil((order.deliveryDate - currentDate) / (1000 * 60 * 60 * 24)) : null;

      // Create rows for each product in the order
      order.items.forEach(item => {
        reportData.push({
          // Order information
          order_id: order.id,
          order_date: order.createdAt.toISOString().split('T')[0],
          order_datetime: order.createdAt,
          order_status: order.status,
          order_total: parseFloat(order.totalAmount),
          delivery_date: order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : null,
          delivery_time_slot: order.deliveryTimeSlot || '',
          delivery_cost: order.deliveryCost ? parseFloat(order.deliveryCost) : 0,
          
          // Customer information
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          customer_type: order.user ? 'Registered' : 'Guest',
          
          // Delivery information
          delivery_type: deliveryTypeLabel,
          delivery_type_code: order.deliveryType,
          delivery_location: deliveryLocation,
          delivery_city: deliveryCity,
          delivery_canton: deliveryCanton,
          station_name: stationName,
          
          // Product information
          product_id: item.product.id,
          product_name: item.product.name,
          product_category_id: item.product.category?.id || null,
          product_category: item.product.category?.name || 'Без категорії',
          product_weight: item.product.weight || '',
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          item_total: parseFloat(item.price) * item.quantity,
          
          // Time periods for grouping (order date)
          order_year: order.createdAt.getFullYear(),
          order_month: order.createdAt.getMonth() + 1,
          order_week: getWeekNumber(order.createdAt),
          order_day_of_week: order.createdAt.getDay(),
          
          // Delivery periods (can be future dates for planning)
          delivery_year: order.deliveryDate ? order.deliveryDate.getFullYear() : null,
          delivery_month: order.deliveryDate ? order.deliveryDate.getMonth() + 1 : null,
          delivery_week: order.deliveryDate ? getWeekNumber(order.deliveryDate) : null,
          delivery_day_of_week: order.deliveryDate ? order.deliveryDate.getDay() : null,
          
          // Planning-specific fields
          is_future_delivery: isFutureDelivery,
          delivery_planning_type: order.deliveryDate ? 
            (isFutureDelivery ? 'Planned' : 'Historical') : 'Not Set',
          days_until_delivery: daysUntilDelivery,
          week_of_year: order.deliveryDate ? getWeekNumber(order.deliveryDate) : null
        });
      });
    });

    console.log(`Generated ${reportData.length} report records`);

    // Calculate planning statistics
    const planningStats = {
      future_deliveries: reportData.filter(r => r.is_future_delivery).length,
      historical_deliveries: reportData.filter(r => !r.is_future_delivery && r.delivery_date).length,
      unscheduled_deliveries: reportData.filter(r => !r.delivery_date).length
    };

    res.json({
      success: true,
      data: reportData,
      summary: {
        total_orders: orders.length,
        total_items: reportData.length,
        date_range: {
          start: startDate || deliveryStartDate || 'all',
          end: endDate || deliveryEndDate || 'all'
        },
        planning_info: planningStats
      }
    });

  } catch (error) {
    console.error('Error fetching orders report data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders report data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get planning-specific report data for future deliveries
export const getPlanningReportData = async (req, res) => {
  try {
    console.log('📊 Reports Controller - getPlanningReportData called');
    
    const { planningStartDate, planningEndDate, deliveryType } = req.query;
    
    // Default to next 4 weeks if no dates provided
    const startDate = planningStartDate || new Date().toISOString().split('T')[0];
    const endDateDefault = new Date();
    endDateDefault.setDate(endDateDefault.getDate() + 28); // 4 weeks ahead
    const endDate = planningEndDate || endDateDefault.toISOString().split('T')[0];

    const whereConditions = {
      deliveryDate: {
        gte: new Date(startDate),
        lte: new Date(endDate + ' 23:59:59')
      }
    };

    // Add delivery type filter if specified
    if (deliveryType && deliveryType !== 'all') {
      whereConditions.deliveryType = deliveryType;
    }

    // Only include confirmed orders for planning
    whereConditions.status = {
      in: ['CONFIRMED', 'PENDING']
    };

    const orders = await prisma.order.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        guestInfo: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { deliveryDate: 'asc' },
        { deliveryTimeSlot: 'asc' }
      ]
    });

    // Transform data optimized for planning
    const planningData = [];
    
    orders.forEach(order => {
      let deliveryLocation = '';
      let stationName = '';
      let deliveryTypeLabel = '';

      switch (order.deliveryType) {
        case 'RAILWAY_STATION':
          deliveryTypeLabel = 'ЖД Станція';
          if (order.deliveryAddress?.station) {
            stationName = order.deliveryAddress.station;
            deliveryLocation = stationName;
          }
          break;
        case 'ADDRESS':
          deliveryTypeLabel = 'Адресна доставка';
          if (order.deliveryAddress) {
            deliveryLocation = `${order.deliveryAddress.city || ''}, ${order.deliveryAddress.canton || ''}`;
          }
          break;
        case 'PICKUP':
          deliveryTypeLabel = 'Самовивіз';
          deliveryLocation = 'Магазин';
          break;
        default:
          deliveryTypeLabel = order.deliveryType || 'Unknown';
      }

      order.items.forEach(item => {
        planningData.push({
          order_id: order.id,
          delivery_date: order.deliveryDate.toISOString().split('T')[0],
          delivery_time_slot: order.deliveryTimeSlot || '',
          delivery_type: deliveryTypeLabel,
          delivery_location: deliveryLocation,
          station_name: stationName,
          product_name: item.product.name,
          product_category: item.product.category?.name || 'Без категорії',
          quantity: item.quantity,
          order_status: order.status,
          customer_name: order.user ? 
            `${order.user.firstName} ${order.user.lastName}` : 
            order.guestInfo ?
            `${order.guestInfo.firstName} ${order.guestInfo.lastName}` :
            'Unknown Customer',
          
          // Planning-specific fields
          days_until_delivery: Math.ceil((order.deliveryDate - new Date()) / (1000 * 60 * 60 * 24)),
          week_of_year: getWeekNumber(order.deliveryDate),
          day_of_week: order.deliveryDate.getDay()
        });
      });
    });

    res.json({
      success: true,
      data: planningData,
      planning_summary: {
        total_orders: orders.length,
        total_items: planningData.length,
        planning_period: { startDate, endDate },
        delivery_types: [...new Set(planningData.map(item => item.delivery_type))]
      }
    });

  } catch (error) {
    console.error('Error fetching planning report data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch planning report data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get summary statistics with planning support
export const getOrdersSummary = async (req, res) => {
  try {
    console.log('📊 Reports Controller - getOrdersSummary called with planning support');
    
    const { period = '30', includeUnscheduled = false } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      totalRevenue,
      futureDeliveries
    ] = await Promise.all([
      // Total orders in period
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Pending orders
      prisma.order.count({
        where: {
          status: 'PENDING',
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Confirmed orders
      prisma.order.count({
        where: {
          status: 'CONFIRMED',
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Delivered orders
      prisma.order.count({
        where: {
          status: 'DELIVERED',
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Total revenue
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          totalAmount: true
        }
      }),

      // Future deliveries for planning
      prisma.order.findMany({
        where: {
          deliveryDate: {
            gt: new Date()
          },
          status: {
            in: ['CONFIRMED', 'PENDING']
          }
        },
        include: {
          items: true
        }
      })
    ]);

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: startDate
          },
          status: { not: 'CANCELLED' }
        }
      },
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get product details for top products
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });

    const productsMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    const topProductsWithNames = topProducts.map(item => ({
      product_id: item.productId,
      product_name: productsMap[item.productId]?.name || 'Unknown Product',
      category: productsMap[item.productId]?.category?.name || 'Unknown Category',
      total_quantity: item._sum.quantity,
      order_count: item._count.id
    }));

    // Get delivery statistics
    const deliveryStats = await prisma.order.groupBy({
      by: ['deliveryType'],
      where: {
        createdAt: {
          gte: startDate
        },
        status: { not: 'CANCELLED' }
      },
      _count: {
        id: true
      }
    });

    // Calculate future planning data
    const futureRevenue = futureDeliveries.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount), 0);

    res.json({
      success: true,
      period_days: parseInt(period),
      summary: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          delivered: deliveredOrders
        },
        revenue: {
          total: totalRevenue._sum.totalAmount || 0
        },
        top_products: topProductsWithNames,
        delivery_stats: deliveryStats.map(stat => ({
          delivery_type: stat.deliveryType,
          count: stat._count.id
        })),
        planning_data: {
          future_deliveries_count: futureDeliveries.length,
          future_revenue: futureRevenue
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};