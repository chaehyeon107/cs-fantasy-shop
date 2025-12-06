// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },
//     nickname: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     role: {
//       type: String,
//       enum: ["ROLE_USER", "ROLE_ADMIN"],
//       default: "ROLE_USER",
//     },
//     provider: {
//       type: String,
//       enum: ["local", "google", "kakao", "naver", "firebase"],
//       default: "local",
//     },
//     // 카카오 id, Firebase uid 같은 외부 ID 저장용
//     providerId: {
//       type: String,
//       required: false,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.comparePassword = function (plainPassword) {
//   return bcrypt.compare(plainPassword, this.password);
// };

// module.exports = mongoose.model("User", userSchema);
