import express from "express";
import router from "./src/routes/Route.js";
import cors from "cors";
import { configDotenv } from "dotenv";
import connectDB from "./src/Db/DB.js";
import multer from "multer";
configDotenv();
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
// app.use(express.urlencoded({ extended: true }));
connectDB();
const upload = multer();
app.use(router);
app.listen(4000, () => {
    console.log("Server is running on port 4000");
});