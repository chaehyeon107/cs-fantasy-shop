const { prisma } = require("../config/prisma");

/**
 * 아이템 생성 (관리자 전용)
 * - body 예시:
 *   - name: string
 *   - price: number
 *   - description?: string
 *   - rarity?: string
 *   - stat_int?: number
 *   - stat_str?: number
 *   - stat_dex?: number
 *   - stat_lck?: number
 *   - cs_tag?: string
 *   - stock_quantity?: number
 *   - is_active?: boolean
 *   - category_id?: string
 */
exports.createItem = async (data) => {
  const newItem = await prisma.item.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description ?? null,
      rarity: data.rarity ?? null,
      // snake_case → Prisma 필드(camelCase) 매핑
      statInt: data.stat_int ?? null,
      statStr: data.stat_str ?? null,
      statDex: data.stat_dex ?? null,
      statLck: data.stat_lck ?? null,
      csTag: data.cs_tag ?? null,
      stockQuantity: data.stock_quantity ?? null,
      isActive: typeof data.is_active === "boolean" ? data.is_active : null,
      categoryId: data.category_id ?? null,
    },
  });

  return newItem;
};

/**
 * 전체 아이템 조회 (최신순)
 */
exports.getItems = async () => {
  return prisma.item.findMany({
    orderBy: { createdAt: "desc" },
  });
};

/**
 * 아이템 수정
 * - 존재하지 않는 id일 경우 null 반환 (컨트롤러에서 ITEM_NOT_FOUND 처리)
 */
exports.updateItem = async (id, data) => {
  // 부분 업데이트를 고려해서 data 객체를 유연하게 구성
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.rarity !== undefined) updateData.rarity = data.rarity;

  if (data.stat_int !== undefined) updateData.statInt = data.stat_int;
  if (data.stat_str !== undefined) updateData.statStr = data.stat_str;
  if (data.stat_dex !== undefined) updateData.statDex = data.stat_dex;
  if (data.stat_lck !== undefined) updateData.statLck = data.stat_lck;

  if (data.cs_tag !== undefined) updateData.csTag = data.cs_tag;
  if (data.stock_quantity !== undefined)
    updateData.stockQuantity = data.stock_quantity;
  if (data.is_active !== undefined) updateData.isActive = data.is_active;
  if (data.category_id !== undefined) updateData.categoryId = data.category_id;

  try {
    const updated = await prisma.item.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return updated;
  } catch (err) {
    // 존재하지 않는 레코드
    if (err.code === "P2025") {
      return null;
    }
    throw err;
  }
};

/**
 * 아이템 삭제
 * - 존재하지 않는 id일 경우 null 반환 (컨트롤러에서 ITEM_NOT_FOUND 처리)
 */
exports.deleteItem = async (id) => {
  try {
    const deleted = await prisma.item.delete({
      where: { id: Number(id) },
    });

    return deleted;
  } catch (err) {
    if (err.code === "P2025") {
      return null;
    }
    throw err;
  }
};

exports.getPopularItems = async (limit) => {
  const result = await prisma.orderItem.groupBy({
    by: ["itemId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  const items = await prisma.item.findMany({
    where: {
      id: { in: result.map(r => r.itemId) },
    },
  });

  return result.map(r => {
    const item = items.find(i => i.id === r.itemId);
    return {
      itemId: r.itemId,
      name: item?.name,
      totalSold: r._sum.quantity,
      price: item?.price,
    };
  });
};

exports.getTopUsers = async (limit) => {
  const result = await prisma.order.groupBy({
    by: ["userId"],
    _sum: {
      totalPrice: true,
    },
    orderBy: {
      _sum: {
        totalPrice: "desc",
      },
    },
    take: limit,
  });

  const users = await prisma.user.findMany({
    where: {
      id: { in: result.map(r => r.userId) },
    },
  });

  return result.map(r => {
    const user = users.find(u => u.id === r.userId);
    return {
      userId: r.userId,
      email: user?.email,
      nickname: user?.nickname,
      totalSpent: r._sum.totalPrice,
    };
  });
};

exports.getOrdersSummary = async (from, to) => {
  return prisma.order.findMany({
    where: {
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    select: {
      id: true,
      userId: true,
      status: true,
      totalPrice: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          nickname: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
