// backend/scripts/createAdmin.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL 또는 ADMIN_PASSWORD 환경변수가 없습니다.");
    process.exit(1);
  }

  console.log(`🔍 관리자 계정 생성/업데이트 진행 중: ${email}`);

  // 1) 비밀번호 해시
  const hashed = await bcrypt.hash(password, 10);

  // 2) upsert로 관리자 계정 보장
  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: "ROLE_ADMIN",
      provider: "local",
    },
    create: {
      email,
      password: hashed,
      nickname: "관리자",
      role: "ROLE_ADMIN",
      provider: "local",
    },
  });

  console.log("✅ 관리자 계정 준비 완료");
  console.log("📌 email:", adminUser.email);
  console.log("📌 role :", adminUser.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
