import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get orders data for pivot table analysis
export const getOrdersReportData = async (req, res) => {
  try {
    console.log('📊 Reports Controller - getOrdersReportData called');
    console.log('Query params:', req.query);

    const { 
      startDate, 
      endDate, 
      status,
      deliveryType 
    } = req.query;

    // Build where conditions
    const whereConditions = {};
    
    // Date filter
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        whereConditions.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereConditions.createdAt.lte = new Date(endDate);
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

    // Fetch orders with all related data - simplified version first
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${orders.length} orders`);

    // Transform data for pivot table
    const reportData = [];

    orders.forEach(order => {
      // Get customer information
      const customerName = order.user 
        ? `${order.user.firstName} ${order.user.lastName}`
        : order.guestInfo 
        ? `${order.guestInfo.firstName} ${order.guestInfo.lastName}`
        : 'Unknown Customer';

      const customerPhone = order.user?.phone || order.guestInfo?.phone || '';
      const customerEmail = order.user?.email || order.guestInfo?.email || '';

      // Get delivery information - simplified
      let deliveryLocation = 'Not specified';
      let deliveryCity = 'Not specified';
      let deliveryCanton = 'Not specified';
      let stationName = '';
      let deliveryTypeLabel = '';

      switch (order.deliveryType) {
        case 'RAILWAY_STATION':
          deliveryTypeLabel = 'ЖД Станция';
          // Try to get station info from deliveryAddress JSON if available
          if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
            stationName = order.deliveryAddress.station || '';
            deliveryLocation = stationName;
            deliveryCity = order.deliveryAddress.city || 'Not specified';
            deliveryCanton = order.deliveryAddress.canton || 'Not specified';
          }
          break;
        case 'ADDRESS':
          deliveryTypeLabel = 'Адресная доставка';
          if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
            deliveryLocation = `${order.deliveryAddress.street || ''} ${order.deliveryAddress.house || ''}`.trim();
            deliveryCity = order.deliveryAddress.city || 'Not specified';
            deliveryCanton = order.deliveryAddress.canton || 'Not specified';
          }
          break;
        case 'PICKUP':
          deliveryTypeLabel = 'Самовывоз';
          if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
            deliveryLocation = order.deliveryAddress.location || 'Store pickup';
            deliveryCity = order.deliveryAddress.city || 'Nyon';
          }
          break;
        default:
          deliveryTypeLabel = order.deliveryType || 'Unknown';
      }

      // Create rows for each product in the order
      order.items.forEach(item => {
        reportData.push({
          // Order information
          order_id: order.id,
          order_date: order.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
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
          product_category: item.product.category?.name || 'Без категории',
          product_weight: item.product.weight || '',
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          item_total: parseFloat(item.price) * item.quantity,
          
          // Time periods for grouping
          order_year: order.createdAt.getFullYear(),
          order_month: order.createdAt.getMonth() + 1,
          order_week: getWeekNumber(order.createdAt),
          order_day_of_week: order.createdAt.getDay(),
          
          // Delivery periods
          delivery_year: order.deliveryDate ? order.deliveryDate.getFullYear() : null,
          delivery_month: order.deliveryDate ? order.deliveryDate.getMonth() + 1 : null,
          delivery_week: order.deliveryDate ? getWeekNumber(order.deliveryDate) : null,
          delivery_day_of_week: order.deliveryDate ? order.deliveryDate.getDay() : null
        });
      });
    });

    console.log(`Generated ${reportData.length} report records`);

    res.json({
      success: true,
      data: reportData,
      summary: {
        total_orders: orders.length,
        total_items: reportData.length,
        date_range: {
          start: startDate || 'all',
          end: endDate || 'all'
        }
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

// Get summary statistics for dashboard
export const getOrdersSummary = async (req, res) => {
  try {
    console.log('📊 Reports Controller - getOrdersSummary called');
    
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      totalRevenue
    ] = await Promise.all([
      // Total orders
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
      })
    ]);

    // Get top products - simplified
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
        }))
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

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}