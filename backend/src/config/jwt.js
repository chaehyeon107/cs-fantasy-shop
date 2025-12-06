const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require("./env");

console.log("[JWT CONFIG] JWT_ACCESS_SECRET exists?", !!JWT_ACCESS_SECRET);
console.log("[JWT CONFIG] JWT_REFRESH_SECRET exists?", !!JWT_REFRESH_SECRET);

module.exports = {
  accessTokenSecret: JWT_ACCESS_SECRET || "dev-access-secret",
  refreshTokenSecret: JWT_REFRESH_SECRET || "dev-refresh-secret",
  accessTokenExpiresIn: "15m",
  refreshTokenExpiresIn: "7d",
};