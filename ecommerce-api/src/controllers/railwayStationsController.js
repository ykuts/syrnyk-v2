import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


    // Station data validation
    const validateStationData = (data) => {
      const errors = [];
      
      if (!data.city || data.city.trim().length === 0) {
        errors.push('City is required');
      }
      
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Station name is required');
      }
      
      if (!data.meetingPoint || data.meetingPoint.trim().length === 0) {
        errors.push('Meeting point is required');
      }
      
      return errors;
    }

  
    // Get all stations with translations
export const getAllStations = async (req, res) => {
  try {
    // Get the requested language from query parameter or header
    const lang = req.query.lang || req.headers['accept-language']?.split(',')[0]?.substring(0, 2) || 'uk';
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const city = req.query.city;
    
    const skip = (page - 1) * limit;
    const where = city ? {
        city: {
            contains: city,
            mode: 'insensitive'
        }
    } : {};

    const [stations, total] = await Promise.all([
        prisma.railwayStation.findMany({
            where,
            skip,
            take: limit,
            orderBy: { city: 'asc' },
            include: {
              translations: {
                where: {
                  language: lang
                }
              }
            }
        }),
        prisma.railwayStation.count({ where })
    ]);

    // Transform response to merge translations with base station data
    const transformedStations = stations.map(station => {
      const translation = station.translations[0] || {};
      
      return {
        ...station,
        // Apply translation if available, otherwise keep original value
        name: translation.name || station.name,
        meetingPoint: translation.meetingPoint || station.meetingPoint,
        // Clean up the response
        translations: undefined
      };
    });

    // Adding full URLs for photos
    const stationsWithPhotos = transformedStations.map(station => ({
      ...station,
      photo: station.photo ? `/uploads/${station.photo}` : null
    }));

    res.json({
      data: stationsWithPhotos,
      meta: {
        total
      }
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  
    // Get a station by ID with translations
export const getStationById = async (req, res) => {
  try {
    // Get the requested language from query parameter or header
    const lang = req.query.lang || req.headers['accept-language']?.split(',')[0]?.substring(0, 2) || 'uk';
    
    const station = await prisma.railwayStation.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        translations: true // Get all translations
      }
    });
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Transform response to make translations more accessible
    const currentTranslation = station.translations.find(t => t.language === lang);
    
    const transformedStation = {
      ...station,
      // Apply current language translation if available
      name: currentTranslation?.name || station.name,
      meetingPoint: currentTranslation?.meetingPoint || station.meetingPoint,
      // Format all translations as an object for easier access
      translations: station.translations.reduce((acc, translation) => {
        acc[translation.language] = {
          name: translation.name,
          meetingPoint: translation.meetingPoint
        };
        return acc;
      }, {})
    };

    res.json(transformedStation);
  } catch (error) {
    console.error('Error fetching station by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  
    // Получить станции по городу
    export const getStationsByCity = async (req, res) => {
      try {
        const stations = await prisma.railwayStation.findMany({
          where: {
            city: {
              contains: req.params.city,
              mode: 'insensitive'
            }
          },
          orderBy: { name: 'asc' }
        });
  
        res.json(stations);
      } catch (error) {
        console.error('Error fetching stations by city:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  
    // Update the createStation function to handle translations
export const createStation = async (req, res) => {
  try {
    const { city, name, meetingPoint, photo, translations } = req.body;

    const cleanPhotoPath = photo ? photo.replace(/^\/uploads\//, '') : null;

    const stationData = {
      city,
      name,
      meetingPoint,
      photo: cleanPhotoPath
    };

    // Validation
    const errors = validateStationData(stationData);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if station already exists
    const existing = await prisma.railwayStation.findFirst({
      where: {
        city: stationData.city,
        name: stationData.name
      }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Station with this name already exists in this city'
      });
    }

    // Add translations if provided
    if (translations && Object.keys(translations).length > 0) {
      stationData.translations = {
        create: Object.entries(translations).map(([language, data]) => ({
          language,
          name: data.name || null,
          meetingPoint: data.meetingPoint || null
        }))
      };
    }

    const station = await prisma.railwayStation.create({
      data: stationData,
      include: {
        translations: true
      }
    });

    res.status(201).json(station);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
  
  // Update the updateStation function to handle translations
export const updateStation = async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);
    const { city, name, meetingPoint, photo, translations } = req.body;

    const stationData = {
      city,
      name,
      meetingPoint,
      photo: photo ? photo.replace(/^\/uploads\//, '') : null
    };

    // Validation
    const errors = validateStationData(stationData);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if station exists
    const existingStation = await prisma.railwayStation.findUnique({
      where: { id: stationId }
    });

    if (!existingStation) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Check for uniqueness
    if (stationData.name !== existingStation.name || stationData.city !== existingStation.city) {
      const duplicate = await prisma.railwayStation.findFirst({
        where: {
          city: stationData.city,
          name: stationData.name,
          id: { not: stationId }
        }
      });

      if (duplicate) {
        return res.status(400).json({
          error: 'Station with this name already exists in this city'
        });
      }
    }

    // Handle translations within a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update base station data
      const updatedStation = await prisma.railwayStation.update({
        where: {
          id: stationId
        },
        data: stationData,
        include: {
          translations: true
        }
      });

      // Handle translations if provided
      if (translations && Object.keys(translations).length > 0) {
        // Delete existing translations
        await prisma.railwayStationTranslation.deleteMany({
          where: { stationId: stationId }
        });

        // Create new translations
        for (const [language, data] of Object.entries(translations)) {
          if (data && Object.keys(data).some(key => data[key])) {
            await prisma.railwayStationTranslation.create({
              data: {
                stationId: stationId,
                language,
                name: data.name || null,
                meetingPoint: data.meetingPoint || null
              }
            });
          }
        }

        // Get updated station with translations
        return await prisma.railwayStation.findUnique({
          where: { id: stationId },
          include: {
            translations: true
          }
        });
      }

      return updatedStation;
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  
    // Удалить станцию
    export const deleteStation = async (req, res) => {
      try {
        await prisma.railwayStation.delete({
          where: { id: parseInt(req.params.id) }
        });
  
        res.json({ message: 'Station deleted successfully' });
      } catch (error) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'Station not found' });
        }
        console.error('Error deleting station:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };

    // Get available languages for translations
export const getAvailableLanguages = async (req, res) => {
  try {
    // Get distinct languages from the database
    const languages = await prisma.railwayStationTranslation.findMany({
      select: {
        language: true
      },
      distinct: ['language']
    });
    
    // Map to simple array of language codes
    const languageCodes = languages.map(l => l.language);
    
    // Add default language if not already present
    if (!languageCodes.includes('uk')) {
      languageCodes.push('uk');
    }
    
    res.json({
      languages: languageCodes
    });
  } catch (error) {
    console.error('Error fetching available languages:', error);
    res.status(500).json({ message: error.message });
  }
};
  
  