import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all delivery zones
export const getDeliveryZones = async (req, res) => {
  try {
    // Consider adding sorting or pagination for larger datasets
    const zones = await prisma.deliveryZone.findMany({
      include: {
        cities: true,
        // You might also want to include timeSlots for a complete view
        timeSlots: true
      },
      orderBy: {
        name: 'asc' // Adding sorting for better user experience
      }
    });
    res.json(zones);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({ error: 'Failed to fetch delivery zones' });
  }
};

// Get delivery cities by postal code
export const getDeliveryCityByPostalCode = async (req, res) => {
  try {
    const { postalCode } = req.params;
    
    // Add input validation
    if (!postalCode || postalCode.trim() === '') {
      return res.status(400).json({ error: 'Postal code is required' });
    }
    
    const city = await prisma.deliveryCity.findFirst({
      where: { postalCode },
      include: {
        zone: true,
      },
    });
    
    if (!city) {
      return res.status(404).json({ message: 'Delivery city not found' });
    }
    
    res.json(city);
  } catch (error) {
    console.error('Error fetching delivery city:', error);
    res.status(500).json({ error: 'Failed to fetch delivery city' });
  }
};

// Get delivery time slots
export const getDeliveryTimeSlots = async (req, res) => {
  try {
    const { zoneId, dayOfWeek, deliveryMethod } = req.query;
    
    // If pickup method is specified, return predefined pickup time slots
    if (deliveryMethod === 'PICKUP') {
      const pickupTimeSlots = [
        {
          id: 1,
          name: "Morning",
          startTime: "09:00",
          endTime: "13:00",
          isActive: true
        },
        {
          id: 2,
          name: "Afternoon",
          startTime: "13:00",
          endTime: "17:00",
          isActive: true
        },
        {
          id: 3,
          name: "Evening",
          startTime: "17:00",
          endTime: "20:00",
          isActive: true
        }
      ];
      
      return res.json(pickupTimeSlots);
    }
    
    // Regular time slots logic for other delivery methods
    const whereClause = { isActive: true };
    
    // Use proper type conversion for numeric parameters
    if (zoneId) {
      whereClause.zoneId = parseInt(zoneId, 10);
      // Handle NaN case for better error handling
      if (isNaN(whereClause.zoneId)) {
        return res.status(400).json({ error: 'Invalid zoneId format' });
      }
    }
    
    if (dayOfWeek) {
      whereClause.dayOfWeek = parseInt(dayOfWeek, 10);
      if (isNaN(whereClause.dayOfWeek) || whereClause.dayOfWeek < 0 || whereClause.dayOfWeek > 6) {
        return res.status(400).json({ error: 'Invalid dayOfWeek format. Must be between 0-6' });
      }
    }
    
    const timeSlots = await prisma.deliveryTimeSlot.findMany({
      where: whereClause,
      // Add ordering for better user experience
      orderBy: {
        startTime: 'asc'
      },
      // Include zone information
      include: {
        zone: true
      }
    });
    
    res.json(timeSlots);
  } catch (error) {
    console.error('Error fetching delivery time slots:', error);
    res.status(500).json({ error: 'Failed to fetch delivery time slots' });
  }
};

// Get pickup locations
export const getPickupLocations = async (req, res) => {
  try {
    // Add sorting and possibly filtering by city or postal code
    const { city, postalCode } = req.query;
    
    let whereClause = {};
    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }
    if (postalCode) {
      whereClause.postalCode = postalCode;
    }
    
    const locations = await prisma.pickupLocation.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      }
    });
    res.json(locations);
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    res.status(500).json({ error: 'Failed to fetch pickup locations' });
  }
};

// Calculate delivery cost
export const calculateDeliveryCost = async (req, res) => {
  try {
    const { deliveryMethod, postalCode, canton, cartTotal } = req.body;
    
    /* // Enhanced input validation
    if (!deliveryMethod) {
      return res.status(400).json({ error: 'Delivery method is required' });
    }
    
    // Validate delivery method is one of the allowed values
    if (!['PICKUP', 'RAILWAY_STATION', 'ADDRESS'].includes(deliveryMethod)) {
      return res.status(400).json({ error: 'Invalid delivery method' });
    } */
    
    // Validate required fields
    if (!deliveryMethod || !['PICKUP', 'RAILWAY_STATION', 'ADDRESS'].includes(deliveryMethod)) {
      return res.status(400).json({ error: 'Invalid delivery method' });
    }
    
      if (!cartTotal || isNaN(parseFloat(cartTotal))) {
      return res.status(400).json({ error: 'Valid cart total is required' });
    }

    const cartTotalNum = parseFloat(cartTotal);
    
    // Delivery minimums for each method
    const DELIVERY_MINIMUMS = {
      PICKUP: 0,           // No minimum for pickup
      RAILWAY_STATION: 0, // 0 CHF minimum for railway delivery
      ADDRESS: 0         // Will be determined by region for address delivery
    };
    
    let deliveryCost = 0;
    let message = '';
    let isValid = true;
    let minimumOrderAmount = DELIVERY_MINIMUMS[deliveryMethod];
    
    // Calculate based on delivery method
    switch (deliveryMethod) {
      case 'PICKUP':
        // Pickup is always free with no minimum
        deliveryCost = 0;
        isValid = true;
        minimumOrderAmount = 0;
        message = 'Free pickup - no minimum order required';
        break;
        
      case 'RAILWAY_STATION':
        // Railway delivery: always free, no minimum
        deliveryCost = 0; // Always free
        isValid = true;
        minimumOrderAmount = 0;
        message = 'Free railway station delivery';
        
        /* if (cartTotalNum < minimumOrderAmount) {
          isValid = false;
          const needed = minimumOrderAmount - cartTotalNum;
          message = `Minimum order for railway delivery is ${minimumOrderAmount} CHF. Add ${needed.toFixed(2)} CHF more to your cart.`;
        } else {
          isValid = true;
          message = 'Free railway station delivery';
        } */
        break;
        
      case 'ADDRESS':
        deliveryCost = 0; // Always free delivery

        // Check if postal code is in Coppet-Lausanne region
        if (postalCode) {
          try {
            const city = await prisma.deliveryCity.findFirst({
              where: { postalCode },
            });
            
            if (city) {
              // Postal code found in database - this is Coppet-Lausanne region
              // NO minimum order required
              minimumOrderAmount = 0;
              isValid = true;
              message = 'Free delivery - no minimum order required for Coppet-Lausanne region';
            } else {
              // Postal code not in database - other Vaud regions or Geneva
              // 200 CHF minimum required
              minimumOrderAmount = 200;
              if (cartTotalNum >= 200) {
                isValid = true;
                message = 'Free delivery for orders over 200 CHF';
              } else {
                isValid = false;
                const needed = 200 - cartTotalNum;
                message = `Minimum order for address delivery is 200 CHF. Add ${needed.toFixed(2)} CHF more to your cart.`;
              }
            }
          } catch (dbError) {
            console.error('Database error checking postal code:', dbError);
            // Fallback: assume 200 CHF minimum
            minimumOrderAmount = 200;
            if (cartTotalNum >= 200) {
              isValid = true;
              message = 'Free delivery for orders over 200 CHF';
            } else {
              isValid = false;
              const needed = 200 - cartTotalNum;
              message = `Minimum order for address delivery is 200 CHF. Add ${needed.toFixed(2)} CHF more to your cart.`;
            }
          }
        } else {
          // No postal code provided - assume 200 CHF minimum
          minimumOrderAmount = 200;
          if (cartTotalNum >= 200) {
            isValid = true;
            message = 'Free delivery for orders over 200 CHF';
          } else {
            isValid = false;
            const needed = 200 - cartTotalNum;
            message = `Minimum order for address delivery is 200 CHF. Add ${needed.toFixed(2)} CHF more to your cart.`;
          }
        }

        /* // Address delivery logic
        if (cartTotalNum < minimumOrderAmount) {
          // Below minimum order
          isValid = false;
          const needed = minimumOrderAmount - cartTotalNum;
          message = `Minimum order for address delivery is ${minimumOrderAmount} CHF. Add ${needed.toFixed(2)} CHF more to your cart.`;
          deliveryCost = 0;
        } else if (cartTotalNum >= 200) {
          // Free delivery for orders 200+ CHF
          deliveryCost = 0;
          isValid = true;
          message = 'Free delivery for orders over 200 CHF';
        } else {
          // Standard delivery fee for orders 100-199 CHF
          if (postalCode) {
            // Check if the city has a free delivery threshold
            try {
              const city = await prisma.deliveryCity.findFirst({
                where: { postalCode },
              });
              
              if (city && cartTotalNum >= city.freeThreshold) {
                deliveryCost = 0;
                message = `Free delivery for orders over ${city.freeThreshold} CHF in this area`;
              } else {
                deliveryCost = 10;
                message = 'Delivery fee: 10 CHF';
              }
            } catch (dbError) {
              console.error('Database error checking postal code:', dbError);
              // Fallback to standard delivery
              deliveryCost = 10;
              message = 'Delivery fee: 10 CHF';
            }
          } else {
            // No postal code provided, use standard delivery
            deliveryCost = 10;
            message = 'Delivery fee: 10 CHF';
          }
          isValid = true;
        } */
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported delivery method' });
    }
    
    // Return comprehensive response
    res.json({
      deliveryCost,
      message,
      isValid,
      minimumOrderAmount,
      deliveryMethod,
      cartTotal: cartTotalNum,
      // Include calculation details for debugging/transparency
      calculationDetails: {
        postalCode,
        canton,
        meetsMinimumOrder: cartTotalNum >= minimumOrderAmount,
        qualifiesForFreeDelivery: deliveryCost === 0,
        minimumOrderRequired: minimumOrderAmount,
        isCoppetLausanneRegion: postalCode ? (minimumOrderAmount === 0) : false
        /* standardFeeApplied: deliveryCost === 10 */
      }
    });
  } catch (error) {
    console.error('Error calculating delivery cost:', error);
    res.status(500).json({ error: 'Failed to calculate delivery cost' });
  }
};

// Get available delivery dates
export const getAvailableDeliveryDates = async (req, res) => {
  try {
    const { deliveryMethod, zoneId, canton } = req.query;
    
    if (!deliveryMethod) {
      return res.status(400).json({ error: 'Delivery method is required' });
    }
    
    if (!['PICKUP', 'RAILWAY_STATION', 'ADDRESS'].includes(deliveryMethod)) {
      return res.status(400).json({ error: 'Invalid delivery method' });
    }
    
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14); // 2 weeks ahead
    
    const availableDates = [];
    const currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0); // Reset time part
    currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
    
    // Get delivery zone if applicable
    let deliveryZone = null;
    
    // Add proper type conversion and error handling
    if (zoneId) {
      const zoneIdInt = parseInt(zoneId, 10);
      if (isNaN(zoneIdInt)) {
        return res.status(400).json({ error: 'Invalid zoneId format' });
      }
      
      deliveryZone = await prisma.deliveryZone.findUnique({
        where: { id: zoneIdInt },
      });
      
      if (!deliveryZone) {
        return res.status(404).json({ error: 'Delivery zone not found' });
      }
    } else if (canton) {
      deliveryZone = await prisma.deliveryZone.findFirst({
        where: { canton },
      });
    }
    
    // Increment by one day until we reach two weeks
    while (currentDate <= twoWeeksFromNow) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      let isAvailable = false;
      let dayName = '';
      
      // Map day numbers to names for better readability in response
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayName = dayNames[dayOfWeek];
      
      if (deliveryMethod === 'PICKUP') {
        // Pickup available only on Saturday (6), Sunday (0), Monday (1), Tuesday (2)
        isAvailable = [0, 1, 2, 6].includes(dayOfWeek);
      } 
      else if (deliveryMethod === 'RAILWAY_STATION') {
        // Railway station delivery on Mondays only
        isAvailable = dayOfWeek === 1; // Monday
      }
      else if (deliveryMethod === 'ADDRESS') {
        if (deliveryZone) {
          // Use the zone's day of week
          isAvailable = dayOfWeek === deliveryZone.dayOfWeek;
        } else if (canton === 'VD') {
          // Vaud canton - deliveries on Saturdays
          isAvailable = dayOfWeek === 6; // Saturday
        } else if (canton === 'GE') {
          // Geneva canton - deliveries on Mondays
          isAvailable = dayOfWeek === 1; // Monday
        }
      }
      
      if (isAvailable) {
        // Format date as ISO string
        const dateString = currentDate.toISOString().split('T')[0];
        availableDates.push({
          date: dateString,
          dayOfWeek: dayOfWeek,
          dayName: dayName
        });
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Enhanced response with more metadata
    res.json({
      deliveryMethod,
      availableDates,
      count: availableDates.length,
      dateRange: {
        from: today.toISOString().split('T')[0],
        to: twoWeeksFromNow.toISOString().split('T')[0]
      },
      zone: deliveryZone ? {
        id: deliveryZone.id,
        name: deliveryZone.name
      } : null
    });
  } catch (error) {
    console.error('Error getting available delivery dates:', error);
    res.status(500).json({ error: 'Failed to get available delivery dates' });
  }
};

/**
 * Update order delivery information
 * Handles changing delivery type, address, station, date/time
 */
export const updateOrderDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { 
      deliveryType, 
      deliveryDate, 
      deliveryTimeSlot,
      // Address delivery fields
      street, 
      house, 
      apartment, 
      city, 
      postalCode,
      // Station delivery fields
      deliveryStationId,
      meetingTime,
      // Pickup delivery fields
      storeId,
      pickupTime
    } = req.body;

    console.log(`Updating delivery for order ${orderId}:`, req.body);

    // Start transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First, get current order with delivery info
      const currentOrder = await tx.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
          addressDelivery: true,
          stationDelivery: true,
          pickupDelivery: true
        }
      });

      if (!currentOrder) {
        throw new Error('Order not found');
      }

      // Clean up old delivery records if delivery type changed
      if (currentOrder.deliveryType !== deliveryType) {
        // Remove old delivery records
        if (currentOrder.addressDelivery) {
          await tx.addressDelivery.delete({
            where: { orderId: parseInt(orderId) }
          });
        }
        if (currentOrder.stationDelivery) {
          await tx.stationDelivery.delete({
            where: { orderId: parseInt(orderId) }
          });
        }
        if (currentOrder.pickupDelivery) {
          await tx.pickupDelivery.delete({
            where: { orderId: parseInt(orderId) }
          });
        }
      }

      // Update main order fields
      const orderUpdateData = {
        deliveryType,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryTimeSlot: deliveryTimeSlot || null,
        deliveryStationId: deliveryType === 'RAILWAY_STATION' ? parseInt(deliveryStationId) : null,
        deliveryPickupLocationId: deliveryType === 'PICKUP' ? parseInt(storeId) : null
      };

      const updatedOrder = await tx.order.update({
        where: { id: parseInt(orderId) },
        data: orderUpdateData
      });

      // Create or update specific delivery records based on type
      let deliveryRecord = null;

      switch (deliveryType) {
        case 'ADDRESS':
          deliveryRecord = await tx.addressDelivery.upsert({
            where: { orderId: parseInt(orderId) },
            update: {
              street: street || '',
              house: house || '',
              apartment: apartment || null,
              city: city || '',
              postalCode: postalCode || ''
            },
            create: {
              orderId: parseInt(orderId),
              street: street || '',
              house: house || '',
              apartment: apartment || null,
              city: city || '',
              postalCode: postalCode || ''
            }
          });
          break;

        case 'RAILWAY_STATION':
          if (deliveryStationId) {
            deliveryRecord = await tx.stationDelivery.upsert({
              where: { orderId: parseInt(orderId) },
              update: {
                stationId: parseInt(deliveryStationId),
                meetingTime: meetingTime ? new Date(meetingTime) : new Date(deliveryDate)
              },
              create: {
                orderId: parseInt(orderId),
                stationId: parseInt(deliveryStationId),
                meetingTime: meetingTime ? new Date(meetingTime) : new Date(deliveryDate)
              }
            });
          }
          break;

        case 'PICKUP':
          if (storeId) {
            deliveryRecord = await tx.pickupDelivery.upsert({
              where: { orderId: parseInt(orderId) },
              update: {
                storeId: parseInt(storeId),
                pickupTime: pickupTime ? new Date(pickupTime) : new Date(deliveryDate)
              },
              create: {
                orderId: parseInt(orderId),
                storeId: parseInt(storeId),
                pickupTime: pickupTime ? new Date(pickupTime) : new Date(deliveryDate)
              }
            });
          }
          break;
      }

      return { updatedOrder, deliveryRecord };
    });

    // Log the delivery change for admin tracking
    const changeLog = `Admin updated delivery: ${deliveryType} on ${new Date().toISOString()}`;
    
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        changes: {
          push: changeLog
        }
      }
    });

    // Fetch complete updated order for response
    const completeOrder = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        addressDelivery: true,
        stationDelivery: {
          include: { station: true }
        },
        pickupDelivery: {
          include: { store: true }
        },
        user: true,
        guestInfo: true,
        items: {
          include: { product: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Delivery information updated successfully',
      order: completeOrder
    });

  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update delivery information'
    });
  }
};

/**
 * Get available delivery options (stations, stores)
 */
export const getDeliveryOptions = async (req, res) => {
  try {
    // Get all available railway stations
    const stations = await prisma.railwayStation.findMany({
      include: {
        translations: true
      },
      orderBy: {
        city: 'asc'
      }
    });

    // Get all available stores for pickup
    const stores = await prisma.store.findMany({
      orderBy: {
        city: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        stations,
        stores
      }
    });

  } catch (error) {
    console.error('Error fetching delivery options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery options'
    });
  }
};

/**
 * Get delivery details for specific order
 */
export const getOrderDeliveryDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        addressDelivery: true,
        stationDelivery: {
          include: { 
            station: {
              include: { translations: true }
            }
          }
        },
        pickupDelivery: {
          include: { store: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      delivery: {
        type: order.deliveryType,
        date: order.deliveryDate,
        timeSlot: order.deliveryTimeSlot,
        details: {
          address: order.addressDelivery,
          station: order.stationDelivery,
          pickup: order.pickupDelivery
        }
      }
    });

  } catch (error) {
    console.error('Error fetching delivery details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery details'
    });
  }
};