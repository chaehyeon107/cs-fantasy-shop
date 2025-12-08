// src/services/order.service.js
const { prisma } = require("../config/prisma");

exports.createOrderFromCart = async (userId) => {
  // 1) 장바구니 조회
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { item: true },
  });

  if (cartItems.length === 0) {
    const error = new Error("장바구니가 비어 있습니다.");
    error.status = 400;
    throw error;
  }

  // 2) 총액 계산
  const totalPrice = cartItems.reduce((sum, ci) => {
    return sum + ci.quantity * ci.item.price;
  }, 0);

  // 3) 트랜잭션으로 주문 + 주문아이템 + 인벤토리 + 장바구니 비우기
  const result = await prisma.$transaction(async (tx) => {
    // 3-1) 주문 생성
    const order = await tx.order.create({
      data: {
        userId,
        status: "PAID", // 결제는 무조건 성공 처리
        totalPrice,
      },
    });

    // 3-2) 주문 아이템 생성
    const orderItemsData = cartItems.map((ci) => ({
      orderId: order.id,
      itemId: ci.itemId,
      quantity: ci.quantity,
      price: ci.item.price,
    }));

    await tx.orderItem.createMany({
      data: orderItemsData,
    });

    // 3-3) 인벤토리 지급 (기존 있으면 수량 증가, 없으면 생성)
    for (const ci of cartItems) {
      await tx.inventory.upsert({
        where: {
          userId_itemId: {
            userId,
            itemId: ci.itemId,
          },
        },
        create: {
          userId,
          itemId: ci.itemId,
          quantity: ci.quantity,
        },
        update: {
          quantity: {
            increment: ci.quantity,
          },
        },
      });
    }

    // 3-4) 장바구니 비우기
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    // 3-5) 주문 + 주문 아이템 + 아이템 정보까지 묶어서 반환
    const fullOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            item: true,
          },
        },
      },
    });

    return fullOrder;
  });

  return result;
};

exports.getMyOrders = (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: { item: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// 선택: 특정 주문 상세
exports.getMyOrderById = (userId, orderId) => {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      orderItems: {
        include: { item: true },
      },
    },
  });
};

// 관리자용: 전체 주문 조회
exports.getAllOrders = async () => {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          nickname: true,
          role: true,
        },
      },
      orderItems: {
        include: {
          item: true,
        },
      },
    },
  });
};