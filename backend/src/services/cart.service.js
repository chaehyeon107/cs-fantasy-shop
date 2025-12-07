const prisma = require("../config/prisma");

exports.addToCart = async (userId, itemId, quantity) => {
  const exists = await prisma.cartItem.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });

  if (exists) {
    return prisma.cartItem.update({
      where: { id: exists.id },
      data: { quantity: exists.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: { userId, itemId, quantity },
  });
};

exports.getMyCart = (userId) => {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { item: true },
  });
};

exports.updateCart = (cartItemId, quantity) => {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

exports.deleteCart = (cartItemId) => {
  return prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

exports.clearCart = (userId) => {
  return prisma.cartItem.deleteMany({
    where: { userId },
  });
};
