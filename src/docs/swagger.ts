import { version } from "mongoose";
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "Dokumentasi API Event",
    description: "Dokumentasi API Event",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local server",
    },
    {
      url: "https://backend-event-farrel.vercel.app/api",
      description: "Production server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "FarrelSZ",
        password: "Farrel123",
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
