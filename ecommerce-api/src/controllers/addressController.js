import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Добавление нового адреса
export const addAddress = async (req, res) => {
  try {
    const { city, station } = req.body;

    // Проверка обязательных полей
    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }

    // Создание нового адреса
    const address = await prisma.address.create({
      data: {
        city,
        station,
      },
    });

    res.status(201).json({
      message: 'Address created successfully',
      address,
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      message: 'Error creating address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Получение всех адресов
export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany();

    res.status(200).json({
      message: 'Addresses retrieved successfully',
      addresses,
    });
  } catch (error) {
    console.error('Error retrieving addresses:', error);
    res.status(500).json({
      message: 'Error retrieving addresses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
