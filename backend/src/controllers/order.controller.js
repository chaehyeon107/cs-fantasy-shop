// src/controllers/order.controller.js
const orderService = require("../services/order.service");
const apiResponse = require("../utils/apiResponse");

exports.createOrderFromCart = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    const order = await orderService.createOrderFromCart(userId);

    return apiResponse.success(res, order, 201);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    const orders = await orderService.getMyOrders(userId);

    return apiResponse.success(res, orders);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrderById = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const orderId = Number(req.params.id);

    const order = await orderService.getMyOrderById(userId, orderId);

    if (!order) {
      return apiResponse.error(res, "주문이 존재하지 않습니다.", 404);
    }

    return apiResponse.success(res, order);
  } catch (err) {
    next(err);
  }
};

// 관리자용
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();

    return apiResponse.success(res, orders);
  } catch (err) {
    next(err);
  }
};
