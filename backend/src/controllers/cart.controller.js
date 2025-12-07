const cartService = require("../services/cart.service");
const apiResponse = require("../utils/apiResponse");

exports.addToCart = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const { itemId, quantity } = req.body;

    const result = await cartService.addToCart(userId, itemId, quantity);

    return apiResponse.success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

exports.getMyCart = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    const cart = await cartService.getMyCart(userId);

    return apiResponse.success(res, cart);
  } catch (err) {
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    const cartItemId = Number(req.params.id);
    const { quantity } = req.body;

    const updated = await cartService.updateCart(cartItemId, quantity);

    return apiResponse.success(res, updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteCart = async (req, res, next) => {
  try {
    const cartItemId = Number(req.params.id);

    await cartService.deleteCart(cartItemId);

    return apiResponse.success(res, null, 204);
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await cartService.clearCart(userId);

    return apiResponse.success(res, null, 204);
  } catch (err) {
    next(err);
  }
};
