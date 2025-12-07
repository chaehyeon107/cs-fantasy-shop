const cartService = require("../services/cart.service");
const apiResponse = require("../utils/apiResponse");

/**
 * ✅ 장바구니 담기
 * POST /api/cart
 * Body: { itemId, quantity }
 */
exports.addToCart = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const { itemId, quantity } = req.body;

    const result = await cartService.addToCart(
      userId,
      Number(itemId),
      Number(quantity)
    );

    return apiResponse.success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 내 장바구니 조회
 * GET /api/cart
 */
exports.getMyCart = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    const cart = await cartService.getMyCart(userId);

    return apiResponse.success(res, cart);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 장바구니 수량 수정 (PATCH /api/cart)
 * Body: { cartItemId, quantity }
 */
exports.updateCart = async (req, res, next) => {
  try {
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || !quantity) {
      return apiResponse.fail(res, "cartItemId와 quantity는 필수입니다.", 400);
    }

    const updated = await cartService.updateCart(
      Number(cartItemId),
      Number(quantity)
    );

    return apiResponse.success(res, updated);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 장바구니 개별 삭제 (DELETE /api/cart)
 * Body: { cartItemId }
 */
exports.deleteCart = async (req, res, next) => {
  try {
    const { cartItemId } = req.body;

    if (!cartItemId) {
      return apiResponse.fail(res, "cartItemId는 필수입니다.", 400);
    }

    await cartService.deleteCart(Number(cartItemId));

    return apiResponse.success(res, null, 204);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ 내 장바구니 전체 비우기
 * DELETE /api/cart/clear
 */
exports.clearCart = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    await cartService.clearCart(userId);

    return apiResponse.success(res, null, 204);
  } catch (err) {
    next(err);
  }
};
