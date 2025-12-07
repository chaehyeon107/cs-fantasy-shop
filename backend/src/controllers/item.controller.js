// backend/src/controllers/item.controller.js
const apiResponse = require("../utils/apiResponse");
const itemService = require("../services/item.service");
const {
  parsePaginationQuery,
  parseSortQuery,
  parseNumberRange,
} = require("../utils/queryUtils");

/**
 * 에러 객체 생성 헬퍼
 * - code, details를 가진 Error를 만들어서 throw할 때 재사용
 */
function createCodeError(code, details) {
  const err = new Error(code);
  err.code = code;
  if (details) err.details = details;
  return err;
}

/**
 * GET /api/items
 * - 공개 아이템 목록 (페이지네이션 + 정렬 + 필터)
 */
exports.listItems = async (req, res, next) => {
  try {
    // 1) 페이지네이션/정렬 파싱
    const { page, size } = parsePaginationQuery(
      req.query.page,
      req.query.size,
      0,
      20,
      50
    );

    const { sort: sortString, orderBy } = parseSortQuery(
      req.query.sort,
      [
        "createdAt",
        "price",
        "name",
        "rarity",
        "statInt",
        "statStr",
        "statDex",
        "statLck",
      ],
      "createdAt",
      "desc"
    );

    // 2) 필터 파라미터 파싱
    const keyword = req.query.keyword;
    const csTag = req.query.csTag;
    const rawRarity = req.query.rarity;

    // rarity는 enum(ItemRarity)과 맞추기 위해 대문자 변환
    const rarity = rawRarity ? String(rawRarity).toUpperCase() : undefined;

    // categoryId는 Int 스키마 기준
    let categoryId;
    if (req.query.categoryId !== undefined) {
      const n = Number(req.query.categoryId);
      if (!Number.isInteger(n) || n <= 0) {
        throw createCodeError("INVALID_QUERY_PARAM", {
          categoryId: req.query.categoryId,
          message: "categoryId는 1 이상의 정수여야 합니다.",
        });
      }
      categoryId = n;
    }

    // 3) 숫자 범위 필터들
    const { min: minPrice, max: maxPrice } = parseNumberRange(
      req.query.minPrice,
      req.query.maxPrice,
      "price"
    );
    const { min: minInt, max: maxInt } = parseNumberRange(
      req.query.minInt,
      req.query.maxInt,
      "statInt"
    );
    const { min: minStr, max: maxStr } = parseNumberRange(
      req.query.minStr,
      req.query.maxStr,
      "statStr"
    );
    const { min: minDex, max: maxDex } = parseNumberRange(
      req.query.minDex,
      req.query.maxDex,
      "statDex"
    );
    const { min: minLck, max: maxLck } = parseNumberRange(
      req.query.minLck,
      req.query.maxLck,
      "statLck"
    );

    // 4) 서비스 호출
    const result = await itemService.getPublicItems({
      page,
      size,
      orderBy,
      sortString,
      keyword,
      categoryId,
      rarity,
      minPrice,
      maxPrice,
      minInt,
      maxInt,
      minStr,
      maxStr,
      minDex,
      maxDex,
      minLck,
      maxLck,
      csTag,
    });

    return apiResponse.success(res, result, 200);
  } catch (err) {
    // 쿼리/범위 에러도 모두 err.code 로 들어가 있으므로
    // 전역 에러 미들웨어에서 sendError로 매핑
    next(err);
  }
};

/**
 * GET /api/items/:id
 * - 공개 아이템 상세 (isActive = true 만)
 */
exports.getItemDetail = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      throw createCodeError("ITEM_ID_INVALID", {
        id: rawId,
      });
    }

    const item = await itemService.getPublicItemById(id);

    if (!item) {
      // 서비스에서 null이면 여기서 404 코드로 변환
      throw createCodeError("ITEM_NOT_FOUND", {
        id,
      });
    }

    return apiResponse.success(res, item, 200);
  } catch (err) {
    next(err);
  }
};
