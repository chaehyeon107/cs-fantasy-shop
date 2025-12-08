// src/controllers/inventory.controller.js
const inventoryService = require("../services/inventory.service");
const apiResponse = require("../utils/apiResponse");

exports.getMyInventory = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    const items = await inventoryService.getMyInventory(userId);

    return apiResponse.success(res, items);
  } catch (err) {
    next(err);
  }
};
