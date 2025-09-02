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
      RegisterRequest: {
        fullName: "member2025",
        username: "member2025",
        email: "member2025@yopmail.com",
        password: "Member2025!",
        confirmPassword: "Member2025!",
      },
      ActivationRequest: {
        code: "abcdef",
      },
      CreateCategoryRequest: {
        name: "",
        description: "",
        icon: "",
      },
      CreateEventsRequest: {
        name: "",
        banner: "fileUrl",
        category: "category objectID",
        description: "",
        startDate: "yyyy-mm-dd hh:mm:ss",
        endDate: "yyyy-mm-dd hh:mm:ss",
        location: {
          region: "region id",
          coordinates: [0, 0],
          _id: "689da3cb266be44e38078031",
        },
        address: "",
        isOnline: false,
        isFeatured: false,
      },
      RemoveMediaRequest: {
        fileUrl: "",
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
