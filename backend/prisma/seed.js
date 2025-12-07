// prisma/seed.js
const { PrismaClient, ItemRarity } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ 계층 구조 카테고리 시드
const categorySeed = [
  // 최상위
  { id: 1, name: "전공 기초", description: "CS 기본 이론 카테고리", parentId: null },
  { id: 2, name: "장비", description: "장비/무기/방어구 카테고리", parentId: null },
  { id: 3, name: "소모품", description: "포션/스크롤/버프 아이템", parentId: null },

  // 전공 기초 하위
  { id: 4, name: "알고리즘", description: "알고리즘 관련 스킬북/아이템", parentId: 1 },
  { id: 5, name: "자료구조", description: "자료구조 관련 스킬북/아이템", parentId: 1 },
  { id: 6, name: "운영체제", description: "OS, concurrency, process 관련", parentId: 1 },
  { id: 7, name: "네트워크", description: "네트워크/프로토콜 관련", parentId: 1 },
  { id: 8, name: "데이터베이스", description: "DB/트랜잭션 관련", parentId: 1 },

  // 장비 하위
  { id: 9, name: "무기", description: "공격용 장비", parentId: 2 },
  { id: 10, name: "방어구", description: "방어용 장비", parentId: 2 },
  { id: 11, name: "액세서리", description: "반지/목걸이 등", parentId: 2 },

  // 소모품 하위
  { id: 12, name: "포션", description: "버프/회복 포션", parentId: 3 },
  { id: 13, name: "스크롤", description: "일회성 스킬 스크롤", parentId: 3 },
];

// 🎯 아이템 설계도: subject + csTag + itemType를 세트로 관리
const ITEM_DESIGNS = [
  // 운영체제/메모리 계열
  { subject: "운영체제", tag: "operating-system", itemType: "메모리 갑옷" },
  { subject: "운영체제", tag: "operating-system", itemType: "쓰레드 헬멧" },
  { subject: "운영체제", tag: "operating-system", itemType: "세마포어 방패" },

  // 컴퓨터구조/하드웨어 느낌
  { subject: "컴퓨터구조", tag: "computer-architecture", itemType: "레지스터 방패" },
  { subject: "컴퓨터구조", tag: "computer-architecture", itemType: "파이프라인 망토" },
  { subject: "컴퓨터구조", tag: "computer-architecture", itemType: "캐시 부적" },

  // 알고리즘
  { subject: "알고리즘", tag: "algorithm", itemType: "DFS 스크롤" },
  { subject: "알고리즘", tag: "algorithm", itemType: "다익스트라 스킬북" },
  { subject: "알고리즘", tag: "algorithm", itemType: "그리디 포션" },

  // 자료구조
  { subject: "자료구조", tag: "datastructure", itemType: "스택 소드" },
  { subject: "자료구조", tag: "datastructure", itemType: "큐 블레이드" },
  { subject: "자료구조", tag: "datastructure", itemType: "힙 랜스" },

  // 정보보안
  { subject: "정보보안", tag: "security", itemType: "암호화 반지" },
  { subject: "정보보안", tag: "security", itemType: "방화벽 방패" },
  { subject: "정보보안", tag: "security", itemType: "침투테스트 단검" },

  // AI
  { subject: "AI", tag: "ai", itemType: "AI 지팡이" },
  { subject: "AI", tag: "ai", itemType: "딥러닝 코어" },
  { subject: "AI", tag: "ai", itemType: "데이터셋 포션" },

  // 네트워크
  { subject: "네트워크", tag: "network", itemType: "패킷 단검" },
  { subject: "네트워크", tag: "network", itemType: "라우터 방패" },
  { subject: "네트워크", tag: "network", itemType: "스위치 부츠" },

  // 데이터베이스
  { subject: "데이터베이스", tag: "database", itemType: "트랜잭션 장갑" },
  { subject: "데이터베이스", tag: "database", itemType: "인덱스 반지" },
  { subject: "데이터베이스", tag: "database", itemType: "쿼리 스크롤" },

  // 웹서비스설계
  { subject: "웹서비스설계", tag: "web-service", itemType: "엔드포인트 부츠" },
  { subject: "웹서비스설계", tag: "web-service", itemType: "API 스크롤" },
  { subject: "웹서비스설계", tag: "web-service", itemType: "로드밸런서 방패" },

  // 임베디드
  { subject: "임베디드", tag: "embedded", itemType: "회로 키트" },
  { subject: "임베디드", tag: "embedded", itemType: "센서 부츠" },
  { subject: "임베디드", tag: "embedded", itemType: "FPGA 로브" },

  // 컴파일러
  { subject: "컴파일러", tag: "compiler", itemType: "파서 검" },
  { subject: "컴파일러", tag: "compiler", itemType: "렉서 단검" },
  { subject: "컴파일러", tag: "compiler", itemType: "IR 스크롤" },
];

const rarityWeights = [
  { type: ItemRarity.COMMON, weight: 0.5 },
  { type: ItemRarity.RARE, weight: 0.3 },
  { type: ItemRarity.EPIC, weight: 0.15 },
  { type: ItemRarity.LEGENDARY, weight: 0.05 },
];

const prefixes = ["마법", "강화", "전설", "희귀", "신비한", "고대", "불멸의"];

function pickWeighted(list) {
  const r = Math.random();
  let sum = 0;
  for (const item of list) {
    sum += item.weight;
    if (r <= sum) return item.type;
  }
  return list[list.length - 1].type;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 🎨 이름 + 태그를 동시에 생성 (항상 일관성 유지)
function randomNameAndTag() {
  const prefix = prefixes[randomInt(0, prefixes.length - 1)];
  const design = ITEM_DESIGNS[randomInt(0, ITEM_DESIGNS.length - 1)];

  const name = `${prefix} ${design.subject} ${design.itemType}`;
  const csTag = design.tag;

  return { name, csTag };
}

async function main() {
  console.log("🌱 Seeding start...");

  // FK 제약 때문에 먼저 아이템, 그다음 카테고리 삭제
  console.log("🧹 Clearing existing items & categories...");
  await prisma.item.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("🌱 Seeding categories...");
  await prisma.category.createMany({
    data: categorySeed.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      parentId: c.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  });

  console.log("🌱 Seeding items (260+)...");

  const items = [];
  const categoryIds = categorySeed.map((c) => c.id);

  for (let i = 0; i < 260; i++) {
    const { name, csTag } = randomNameAndTag();

    items.push({
      name,
      price: randomInt(1000, 200000),
      description: "자동 생성된 CS Fantasy 아이템",
      rarity: pickWeighted(rarityWeights),
      statInt: randomInt(0, 30),
      statStr: randomInt(0, 30),
      statDex: randomInt(0, 30),
      statLck: randomInt(0, 30),
      csTag, // ✅ 이름과 일치하는 태그
      stockQuantity: randomInt(0, 300),
      isActive: Math.random() > 0.05,
      categoryId: categoryIds[randomInt(0, categoryIds.length - 1)],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await prisma.item.createMany({ data: items });

  console.log("✅ Seed completed:", items.length, "items +", categorySeed.length, "categories");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
