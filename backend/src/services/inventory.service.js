// src/services/inventory.service.js
const { prisma } = require("../config/prisma");

exports.getMyInventory = (userId) => {
  return prisma.inventory.findMany({
    where: { userId },
    include: {
      item: true,
    },
  });
};
