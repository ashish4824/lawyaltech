import mongoose from "mongoose";
const notfaction = new mongoose.Schema({
    title: String,
    body: String,
    timestamp: String,
});
const Nonfiction = mongoose.model("Nonfiction", notfaction);
export default Nonfiction;