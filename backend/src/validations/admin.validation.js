// backend/src/validations/admin.validation.js
const { body, param } = require("express-validator");

// Prisma ItemRarity Enum (선택 사항: 문자열로 직접 써도 되지만, Enum과 맞추면 더 안전)
const ALLOWED_RARITIES = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

/**
 * 아이템 생성 DTO
 * - 관리자 전용
 * - 필수: name, price
 * - 선택: description, rarity, stat_* 계열, cs_tag, stock_quantity, is_active, category_id
 */
exports.createItemValidation = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("ITEM_NAME_INVALID"),

  body("price")
    .isNumeric()
    .withMessage("ITEM_PRICE_MUST_BE_NUMBER")
    .custom((value) => Number(value) >= 0)
    .withMessage("ITEM_PRICE_MUST_BE_POSITIVE"),

  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("ITEM_DESCRIPTION_INVALID"),

  body("rarity")
    .optional()
    .isString()
    .isIn(ALLOWED_RARITIES)
    .withMessage("ITEM_RARITY_INVALID"),

  // 스탯 계열 (0 이상 정수)
  body("stat_int")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),
  body("stat_str")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),
  body("stat_dex")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),
  body("stat_lck")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),

  body("cs_tag")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("ITEM_CATEGORY_INVALID"),

  body("stock_quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STOCK_INVALID"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("ITEM_IS_ACTIVE_INVALID"),

  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ITEM_CATEGORY_INVALID"),
];

/**
 * 아이템 수정 DTO
 * - 부분 업데이트(Partial Update) 가능
 * - param id + body 전부 optional
 */
exports.updateItemValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ITEM_ID_INVALID"),

  body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("ITEM_NAME_INVALID"),

  body("price")
    .optional()
    .isNumeric()
    .withMessage("ITEM_PRICE_MUST_BE_NUMBER")
    .custom((value) => Number(value) >= 0)
    .withMessage("ITEM_PRICE_MUST_BE_POSITIVE"),

  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("ITEM_DESCRIPTION_INVALID"),

  body("rarity")
    .optional()
    .isString()
    .isIn(ALLOWED_RARITIES)
    .withMessage("ITEM_RARITY_INVALID"),

  body("stat_int")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),
  body("stat_str")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),
  body("stat_dex")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),
  body("stat_lck")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STAT_INVALID"),

  body("cs_tag")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("ITEM_CATEGORY_INVALID"),

  body("stock_quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ITEM_STOCK_INVALID"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("ITEM_IS_ACTIVE_INVALID"),

  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ITEM_CATEGORY_INVALID"),
];

/**
 * 삭제/단건 조회 시 id 검증용
 */
exports.itemIdParamValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ITEM_ID_INVALID"),
];
