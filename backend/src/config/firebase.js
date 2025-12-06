const admin = require("firebase-admin");
const path = require("path");

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  // 1) .env 에서 경로 읽기
  let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  // 2) 설정 안 했으면 기본값 (backend/firebase-service-account.json)
  if (!serviceAccountPath) {
    serviceAccountPath = path.join(__dirname, "..", "..", "cs-fantasy-shop-firebase-adminsdk-fbsvc-019f1203e2.json");
  } else {
    // env는 보통 backend 기준 상대경로니까 절대경로로 변환
    serviceAccountPath = path.resolve(process.cwd(), serviceAccountPath);
  }

  console.log("🔥 Firebase service account path:", serviceAccountPath);

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  console.log("✅ Firebase Admin initialized");

  return admin;
}

module.exports = { initFirebase };
