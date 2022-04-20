import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";

const app = express();
dotenv.config();

mongoose.connect(`${process.env.MONGODB_URI}`, (err) => {
	if (err) return console.log("DB connection error: ", err);
	console.log("Connected to DB!");
});

app.use(cors());

app.use(express.static("public"));

app.use("/api", routes);

app.use("/api/*", (req, res, next) => {
	next({ error: "Path not found!" });
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
	console.log("Error Handling Middleware called");
	console.log("Path: ", req.path);
	console.error("Error: ", error);

	res.status(500).send(error);
});

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server is running on port ${process.env.PORT || 3000}!`);
});
