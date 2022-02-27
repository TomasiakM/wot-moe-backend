"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
dotenv_1.default.config();
mongoose_1.default.connect(`${process.env.MONGODB_URI}`, (err) => {
    if (err)
        return console.log("DB connection error: ", err);
    console.log("Connected to DB!");
});
app.use(express_1.default.static("public"));
app.use("/api", routes_1.default);
app.use("/api/*", (req, res, next) => {
    next({ error: "Path not found!" });
});
app.use((error, req, res, next) => {
    console.log("Error Handling Middleware called");
    console.log("Path: ", req.path);
    console.error("Error: ", error);
    res.status(500).send(error);
});
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/index.html"));
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}!`);
});
