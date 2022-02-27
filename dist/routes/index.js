"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const player_1 = __importDefault(require("./player"));
const clan_1 = __importDefault(require("./clan"));
const tank_1 = __importDefault(require("./tank"));
const statistics_1 = __importDefault(require("./statistics"));
const router = (0, express_1.Router)();
router.use("/player", player_1.default);
router.get("/clan/:name", clan_1.default);
router.get("/tank", tank_1.default);
router.get("/statistics", statistics_1.default);
exports.default = router;
