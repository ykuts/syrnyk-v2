// ecommerce-api/src/controllers/pivotConfigController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all saved pivot configurations for the current user
export const getPivotConfigurations = async (req, res) => {
  try {
    console.log('📊 Getting pivot configurations for user:', req.user.id);
    
    const configurations = await prisma.pivotConfiguration.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`Found ${configurations.length} configurations`);

    res.json({
      success: true,
      data: configurations
    });

  } catch (error) {
    console.error('Error fetching pivot configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pivot configurations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Save a new pivot configuration
export const savePivotConfiguration = async (req, res) => {
  try {
    console.log('📊 Saving pivot configuration for user:', req.user.id);
    
    const {
      name,
      description,
      configuration,
      filters,
      isDefault
    } = req.body;

    // Validate required fields
    if (!name || !configuration) {
      return res.status(400).json({
        success: false,
        message: 'Name and configuration are required'
      });
    }

    // Check if configuration with this name already exists for this user
    const existingConfig = await prisma.pivotConfiguration.findFirst({
      where: {
        userId: req.user.id,
        name: name
      }
    });

    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: 'Configuration with this name already exists'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.pivotConfiguration.updateMany({
        where: {
          userId: req.user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // Create new configuration
    const newConfiguration = await prisma.pivotConfiguration.create({
      data: {
        userId: req.user.id,
        name,
        description: description || '',
        configuration: JSON.stringify(configuration),
        filters: filters ? JSON.stringify(filters) : null,
        isDefault: isDefault || false
      }
    });

    console.log('Configuration saved with ID:', newConfiguration.id);

    res.status(201).json({
      success: true,
      data: {
        id: newConfiguration.id,
        name: newConfiguration.name,
        description: newConfiguration.description,
        configuration: JSON.parse(newConfiguration.configuration),
        filters: newConfiguration.filters ? JSON.parse(newConfiguration.filters) : null,
        isDefault: newConfiguration.isDefault,
        createdAt: newConfiguration.createdAt,
        updatedAt: newConfiguration.updatedAt
      },
      message: 'Configuration saved successfully'
    });

  } catch (error) {
    console.error('Error saving pivot configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save pivot configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update existing pivot configuration
export const updatePivotConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      configuration,
      filters,
      isDefault
    } = req.body;

    console.log('📊 Updating pivot configuration:', id);

    // Check if configuration exists and belongs to user
    const existingConfig = await prisma.pivotConfiguration.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.pivotConfiguration.updateMany({
        where: {
          userId: req.user.id,
          isDefault: true,
          id: { not: parseInt(id) }
        },
        data: {
          isDefault: false
        }
      });
    }

    // Update configuration
    const updatedConfiguration = await prisma.pivotConfiguration.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: name || existingConfig.name,
        description: description !== undefined ? description : existingConfig.description,
        configuration: configuration ? JSON.stringify(configuration) : existingConfig.configuration,
        filters: filters ? JSON.stringify(filters) : existingConfig.filters,
        isDefault: isDefault !== undefined ? isDefault : existingConfig.isDefault
      }
    });

    res.json({
      success: true,
      data: {
        id: updatedConfiguration.id,
        name: updatedConfiguration.name,
        description: updatedConfiguration.description,
        configuration: JSON.parse(updatedConfiguration.configuration),
        filters: updatedConfiguration.filters ? JSON.parse(updatedConfiguration.filters) : null,
        isDefault: updatedConfiguration.isDefault,
        createdAt: updatedConfiguration.createdAt,
        updatedAt: updatedConfiguration.updatedAt
      },
      message: 'Configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating pivot configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pivot configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete pivot configuration
export const deletePivotConfiguration = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📊 Deleting pivot configuration:', id);

    // Check if configuration exists and belongs to user
    const existingConfig = await prisma.pivotConfiguration.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    // Delete configuration
    await prisma.pivotConfiguration.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting pivot configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pivot configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get default configuration for user
export const getDefaultConfiguration = async (req, res) => {
  try {
    console.log('📊 Getting default configuration for user:', req.user.id);
    
    const defaultConfig = await prisma.pivotConfiguration.findFirst({
      where: {
        userId: req.user.id,
        isDefault: true
      }
    });

    if (!defaultConfig) {
      return res.json({
        success: true,
        data: null,
        message: 'No default configuration found'
      });
    }

    res.json({
      success: true,
      data: {
        id: defaultConfig.id,
        name: defaultConfig.name,
        description: defaultConfig.description,
        configuration: JSON.parse(defaultConfig.configuration),
        filters: defaultConfig.filters ? JSON.parse(defaultConfig.filters) : null,
        isDefault: defaultConfig.isDefault,
        createdAt: defaultConfig.createdAt,
        updatedAt: defaultConfig.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching default configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};