import express from "express";
import router from "./src/routes/Route.js";
import cors from "cors";
import { configDotenv } from "dotenv";
import connectDB from "./src/Db/DB.js";
import UserRouter from "./src/routes/UserRoute.js";
import Nonfiction from "./src/models/Nonfiction.model.js";
configDotenv();
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
// app.use(express.urlencoded({ extended: true }));
connectDB();
app.use( UserRouter);
app.use(router);
app.post('/nonfiction', (req, res) => {
    const { title, body, timestamp } = req.body;
    const nonfiction = new Nonfiction({ title, body, timestamp });
    nonfiction.save();
    res.status(200).json({ message: 'Nonfiction created successfully' });
});
app.get('/nonfiction', (req, res) => {
    Nonfiction.find().then(nonfiction => {
        res.status(200).json({ message: 'Nonfiction fetched successfully', data: nonfiction });
    });
});
app.listen(4000, () => {
    console.log("Server is running on port http://localhost:4000");
});