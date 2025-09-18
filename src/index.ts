import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";
import docs from "./docs/route";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware";

async function init() {
  try {
    const app = express();
    const PORT = 3000;

    const result = await db();
    console.log("database status", result);

    app.use(cors());
    app.use(bodyParser.json());
    app.use("/api", router);

    docs(app);

    app.get("/", (req, res) => {
      res.status(200).json({ message: "Server's running", data: null });
      // bikin kalau error
      res.status(500).json({ message: "Ada error, coba cek di log", data: null });
    });

    app.use(errorMiddleware.serverRoute());
    app.use(errorMiddleware.serverError());

    app.listen(PORT, () => {
      console.log(`Server's running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
