// backend/src/utils/queryUtils.js

/**
 * 공통 에러 유틸
 * - code, details를 가진 Error 객체를 던져서 컨트롤러에서 sendError로 매핑
 */
function throwBadRequest(code, details) {
  const err = new Error(code);
  err.code = code;
  err.details = details;
  throw err;
}

/**
 * 페이지네이션 파라미터 파싱
 * @param {string|undefined} rawPage
 * @param {string|undefined} rawSize
 * @param {number} defaultPage
 * @param {number} defaultSize
 * @param {number} maxSize
 * @returns {{page: number, size: number}}
 * @throws {Error} - code: "INVALID_QUERY_PARAM"
 */
function parsePaginationQuery(
  rawPage,
  rawSize,
  defaultPage = 0,
  defaultSize = 20,
  maxSize = 50
) {
  const pageStr = rawPage ?? String(defaultPage);
  const sizeStr = rawSize ?? String(defaultSize);

  const page = Number(pageStr);
  const size = Number(sizeStr);

  if (!Number.isInteger(page) || page < 0) {
    throwBadRequest("INVALID_QUERY_PARAM", {
      page: pageStr,
      message: "page는 0 이상의 정수여야 합니다.",
    });
  }

  if (!Number.isInteger(size) || size <= 0 || size > maxSize) {
    throwBadRequest("INVALID_QUERY_PARAM", {
      size: sizeStr,
      message: `size는 1~${maxSize} 범위의 정수여야 합니다.`,
    });
  }

  return { page, size };
}

/**
 * 정렬 파라미터 파싱
 * @param {string|undefined} rawSort - 예: "price,DESC"
 * @param {string[]} allowedFields - 예: ["createdAt", "price", "name"]
 * @param {string} defaultField   - 예: "createdAt"
 * @param {"asc"|"desc"} defaultDirection
 * @returns {{sort: string, orderBy: object}}
 */
function parseSortQuery(
  rawSort,
  allowedFields,
  defaultField = "createdAt",
  defaultDirection = "desc"
) {
  if (!rawSort) {
    return {
      sort: `${defaultField},${defaultDirection.toUpperCase()}`,
      orderBy: { [defaultField]: defaultDirection },
    };
  }

  const [field, dirRaw] = String(rawSort).split(",");
  const direction = (dirRaw || "DESC").toLowerCase();

  if (!allowedFields.includes(field)) {
    throwBadRequest("INVALID_QUERY_PARAM", {
      sort: rawSort,
      message: `정렬 필드는 ${allowedFields.join(", ")} 중 하나여야 합니다.`,
    });
  }

  if (!["asc", "desc"].includes(direction)) {
    throwBadRequest("INVALID_QUERY_PARAM", {
      sort: rawSort,
      message: "정렬 방향은 ASC 또는 DESC 여야 합니다.",
    });
  }

  return {
    sort: `${field},${direction.toUpperCase()}`,
    orderBy: { [field]: direction },
  };
}

/**
 * 숫자 범위 파라미터 파싱 (min/max)
 * @param {string|undefined} rawMin
 * @param {string|undefined} rawMax
 * @param {string} fieldName - 예: "price"
 * @returns {{min?: number, max?: number}}
 * @throws {Error} - code: "UNPROCESSABLE_ENTITY" (min > max) 또는 "INVALID_QUERY_PARAM" (숫자 아님)
 */
function parseNumberRange(rawMin, rawMax, fieldName) {
  let min, max;

  if (rawMin !== undefined) {
    const n = Number(rawMin);
    if (Number.isNaN(n)) {
      throwBadRequest("INVALID_QUERY_PARAM", {
        [fieldName]: rawMin,
        message: `${fieldName} 최소값은 숫자여야 합니다.`,
      });
    }
    min = n;
  }

  if (rawMax !== undefined) {
    const n = Number(rawMax);
    if (Number.isNaN(n)) {
      throwBadRequest("INVALID_QUERY_PARAM", {
        [fieldName]: rawMax,
        message: `${fieldName} 최대값은 숫자여야 합니다.`,
      });
    }
    max = n;
  }

  if (min !== undefined && max !== undefined && min > max) {
    const err = new Error("UNPROCESSABLE_ENTITY");
    err.code = "UNPROCESSABLE_ENTITY";
    err.details = {
      field: fieldName,
      min,
      max,
      message: `${fieldName}의 최소값이 최대값보다 클 수 없습니다.`,
    };
    throw err;
  }

  return { min, max };
}

module.exports = {
  throwBadRequest,
  parsePaginationQuery,
  parseSortQuery,
  parseNumberRange,
};
