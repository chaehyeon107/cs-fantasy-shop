// backend/src/services/item.service.js
const { prisma } = require("../config/prisma");

/**
 * 내부 헬퍼: 코드 기반 Error 생성
 */
function createCodeError(code, details) {
  const err = new Error(code);
  err.code = code;
  if (details) err.details = details;
  return err;
}

/**
 * 공개용 아이템 목록 조회 (페이지네이션 + 정렬 + 필터)
 *
 * options: {
 *   page, size,
 *   orderBy,
 *   sortString,
 *   keyword, categoryId, rarity,
 *   minPrice, maxPrice,
 *   minInt, maxInt,
 *   minStr, maxStr,
 *   minDex, maxDex,
 *   minLck, maxLck,
 *   csTag,
 * }
 */
async function getPublicItems(options) {
  const {
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
  } = options;

  const where = {
    isActive: true, // 공개 상태인 아이템만
  };

  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  if (categoryId !== undefined) {
    where.categoryId = categoryId;
  }

  if (rarity) {
    // 컨트롤러에서 이미 대문자로 정제해서 내려 보낸다고 가정
    where.rarity = rarity;
  }

  if (csTag) {
    // 태그는 부분 일치 + 대소문자 무시
    where.csTag = { contains: csTag };
  }

  // 공통 range helper
  function addRange(fieldName, minVal, maxVal) {
    if (minVal !== undefined || maxVal !== undefined) {
      where[fieldName] = {};
      if (minVal !== undefined) where[fieldName].gte = minVal;
      if (maxVal !== undefined) where[fieldName].lte = maxVal;
    }
  }

  addRange("price", minPrice, maxPrice);
  addRange("statInt", minInt, maxInt);
  addRange("statStr", minStr, maxStr);
  addRange("statDex", minDex, maxDex);
  addRange("statLck", minLck, maxLck);

  const skip = page * size;
  const take = size;

  try {
    const [totalElements, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          // Category까지 같이 가져와서 N+1 방지
          category: true,
        },
      }),
    ]);

    const totalPages =
      totalElements === 0 ? 0 : Math.ceil(totalElements / size);

    return {
      content: items,
      page,
      size,
      totalElements,
      totalPages,
      sort: sortString,
    };
  } catch (err) {
    // Prisma 관련 에러는 DATABASE_ERROR로 감싸서 던짐
    console.error("❌ Prisma error in getPublicItems:", err);
    throw createCodeError("DATABASE_ERROR", {
      message: err.message,
    });
  }
}

/**
 * 공개용 아이템 상세 조회
 * - isActive = true 인 것만
 * - 존재하지 않으면 null 반환 (404는 컨트롤러에서 처리)
 */
async function getPublicItemById(id) {
  try {
    const item = await prisma.item.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    // 여기서는 ITEM_NOT_FOUND를 던지지 않고 null만 리턴
    return item; // null이면 컨트롤러에서 404 처리
  } catch (err) {
    console.error("❌ Prisma error in getPublicItemById:", err);
    throw createCodeError("DATABASE_ERROR", {
      message: err.message,
    });
  }
}

module.exports = {
  getPublicItems,
  getPublicItemById,
};
