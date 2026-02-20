const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ERP API",
      version: "1.0.0",
    },
    components: {
        securitySchemes: {
            bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
            }
        }
        },
    servers: [{ url: "http://localhost:5000" }],
  },
  apis: ["./routes/*.js"], // <-- FIXED
};

module.exports = swaggerJSDoc(options);