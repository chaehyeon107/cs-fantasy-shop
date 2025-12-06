const axios = require("axios");
const {
  KAKAO_REST_API_KEY,
  KAKAO_REDIRECT_URI,
} = require("../config/env");

console.log("[KAKAO CONFIG] REST_API_KEY exists?", !!KAKAO_REST_API_KEY);
console.log("[KAKAO CONFIG] REDIRECT_URI:", KAKAO_REDIRECT_URI);

// 1) 인가 코드 → Kakao 토큰 요청
async function getKakaoTokens(authCode) {
  const response = await axios.post(
    "https://kauth.kakao.com/oauth/token",
    null,
    {
      params: {
        grant_type: "authorization_code",
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: KAKAO_REDIRECT_URI,
        code: authCode,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  // { access_token, token_type, refresh_token, expires_in, ... }
  return response.data;
}

// 2) access_token → Kakao 사용자 정보 조회
async function getKakaoUser(accessToken) {
  const kakaoRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return kakaoRes.data; // 그대로 반환
}

module.exports = {
  getKakaoTokens,
  getKakaoUser,
};
