"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = __importDefault(require("../models/Player"));
const Statistics_1 = __importDefault(require("../models/Statistics"));
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lastDay = new Date();
        lastDay.setDate(new Date().getDate() - 1);
        lastDay.setHours(23, 59, 59, 999);
        const stats = yield Statistics_1.default.findOne({
            created_at: { $gte: lastDay },
        });
        if (!stats) {
            const users = yield userCount();
            const marked = yield markedTanks();
            const popular = yield popularTanks();
            if (!users.data || !marked.data || !popular.data) {
                return res.send({ error: "An error has occurred. Try again!" });
            }
            const { total_players, new_players_last_day } = users.data;
            const newStats = yield Statistics_1.default.create({
                total_players,
                new_players_last_day,
                marked_tank_top_list: marked.data,
                popular_tanks_top_list: popular.data,
            });
            const savedStats = yield newStats.save();
            return res.send({
                success: true,
                statistics: savedStats,
            });
        }
        return res.send({ success: true, statistics: stats });
    }
    catch (err) {
        return res.send({ error: "An error has occurred. Try again!" });
    }
});
const popularTanks = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tanks = yield Player_1.default.aggregate([
            {
                $unwind: "$tanks",
            },
            {
                $group: {
                    _id: "$tanks.tank_id",
                    tank_id: {
                        $first: "$tanks.tank_id",
                    },
                    amount: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
            {
                $sort: {
                    amount: -1,
                },
            },
            {
                $limit: 10,
            },
        ]);
        return { data: tanks };
    }
    catch (err) {
        return { error: true };
    }
});
const markedTanks = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tanks = yield Player_1.default.aggregate([
            {
                $unwind: "$tanks",
            },
            {
                $match: {
                    "tanks.marksOnGun": {
                        $eq: 3,
                    },
                },
            },
            {
                $group: {
                    _id: "$tanks.tank_id",
                    tank_id: {
                        $first: "$tanks.tank_id",
                    },
                    amount: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    amount: -1,
                },
            },
            { $limit: 10 },
            { $project: { _id: 0, tank_id: 1, amount: 1 } },
        ]);
        return { data: tanks };
    }
    catch (err) {
        return { error: true };
    }
});
const userCount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dayStart = new Date();
        const dayEnd = new Date();
        dayStart.setDate(new Date().getDate() - 1);
        dayStart.setHours(0, 0, 0, 0);
        dayEnd.setDate(new Date().getDate() - 1);
        dayEnd.setHours(23, 59, 59, 999);
        const users = yield Player_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    total_players: {
                        $sum: 1,
                    },
                    new_players_last_day: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$created_at", dayStart] },
                                        { $lte: ["$created_at", dayEnd] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $project: { _id: 0 },
            },
        ]);
        return { data: users[0] };
    }
    catch (err) {
        return { error: true };
    }
});
