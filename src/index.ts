import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";

async function init() {
  try {
    const app = express();

    const result = await db();
    console.log("database status", result);

    const PORT = 3000;

    app.use(bodyParser.json());
    app.use("/api", router);

    app.get("/", (req, res) => {
      res.status(200).json({ message: "Hello World!", data: null });
    });

    app.listen(PORT, () => {
      console.log(`Server's running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
