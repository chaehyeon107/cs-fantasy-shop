const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CS Fantasy Shop API",
      version: "1.0.0",
      description:
        "CS Fantasy Shop Backend API Documentation (JWT Auth supported)",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
      {
        url: "http://113.198.66.68:13210",
        description: "Production server (JCloud)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // ⭐ 여기 중요: Swagger 주석을 읽을 파일들
  apis: ["./routes/**/*.js"],
};

module.exports = swaggerJSDoc(options);
