import { Router } from "express";
import player from "./player";
import clan from "./clan";
import tank from "./tank";
import stats from "./statistics";

const router = Router();

router.use("/player", player);
router.get("/clan/:name", clan);
router.get("/tank", tank);
router.get("/statistics", stats);

export default router;
