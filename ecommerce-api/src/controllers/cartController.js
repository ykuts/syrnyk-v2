import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user's cart
export const getCart = async (req, res) => {
  const { userId } = req.user;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId }, include: { cartItems: true } });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
  const { userId } = req.user;
  const { productId, quantity } = req.body;

  try {
    const cart = await prisma.cart.upsert({
      where: { userId },
      create: {
        userId,
        cartItems: { create: [{ productId, quantity }] },
      },
      update: {
        cartItems: { create: { productId, quantity } },
      },
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cartItem.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

