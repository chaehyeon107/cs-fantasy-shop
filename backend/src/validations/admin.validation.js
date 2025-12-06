const { body, param } = require("express-validator");

// 아이템 생성 DTO
exports.createItemValidation = [
  body("name")
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("ITEM_NAME_INVALID"),
  body("price")
    .isNumeric()
    .withMessage("ITEM_PRICE_MUST_BE_NUMBER")
    .custom((value) => value >= 0)
    .withMessage("ITEM_PRICE_MUST_BE_POSITIVE"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("ITEM_STOCK_INVALID"),
  body("category")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("ITEM_CATEGORY_INVALID"),
];

// 아이템 수정 DTO (부분 수정이 가능하므로 optional)
exports.updateItemValidation = [
  param("id")
    .isMongoId()
    .withMessage("ITEM_ID_INVALID"),
  body("name")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("ITEM_NAME_INVALID"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("ITEM_PRICE_MUST_BE_NUMBER")
    .custom((value) => value >= 0)
    .withMessage("ITEM_PRICE_MUST_BE_POSITIVE"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STOCK_INVALID"),
  body("category")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("ITEM_CATEGORY_INVALID"),
];

// 삭제, 조회 시 id 검증용
exports.itemIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("ITEM_ID_INVALID"),
];
