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
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Player_1 = __importDefault(require("../models/Player"));
const APICalls_1 = require("../scripts/APICalls");
const queue = require("express-queue");
const router = (0, express_1.Router)();
router.get("/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name } = req.params;
        const player = yield (0, APICalls_1.findPlayerByName)(name);
        if (((_a = player.data) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            return res.send({ playerNotFound: true });
        }
        const { account_id } = player.data[0];
        const playerData = yield (0, APICalls_1.findPlayerById)(account_id);
        const { clan_id } = playerData.data[account_id];
        let clan = null;
        if (clan_id) {
            const clanData = yield (0, APICalls_1.findClanById)(clan_id);
            clan = convertClanData(clanData.data[clan_id]);
        }
        const dayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
        const mongoAchiev = yield Player_1.default.findOne({
            account_id,
            updated_at: { $gte: dayAgo },
        });
        const tanks = yield getStatsAndAchevements(account_id, mongoAchiev);
        if (tanks.error)
            return res.send(tanks);
        return res.send({
            success: true,
            data: Object.assign(Object.assign({}, convertPlayerData(playerData.data[account_id])), { clan,
                tanks }),
        });
    }
    catch (err) {
        res.send({ error: "An error has occurred. Try again!" });
    }
}));
router.get("/achievements/:account_id", queue({ activeLimit: 10 }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account_id = Number(req.params.account_id);
        const tanksData = yield (0, APICalls_1.getPlayerTanksAchevements)(account_id);
        const playerTanks = tanksData.data[account_id];
        let tanks = [];
        if (playerTanks === null || playerTanks === void 0 ? void 0 : playerTanks.length) {
            tanks = playerTanks.map((e) => {
                const { marksOnGun = 0 } = e.achievements;
                const { tank_id } = e;
                return { tank_id, marksOnGun };
            });
        }
        yield Player_1.default.updateOne({ account_id }, { account_id, tanks }, { upsert: true });
        res.send({ account_id, tanks });
    }
    catch (err) {
        res.send({ error: "An error has occurred. Try again!" });
    }
}));
exports.default = router;
const convertClanData = (data) => {
    const { name, tag, color, clan_id } = data;
    const logo = data.emblems.x195.portal;
    return {
        name,
        tag,
        color,
        clan_id,
        logo,
    };
};
const convertPlayerData = (data) => {
    const { max_xp, max_xp_tank_id, max_frags, max_frags_tank_id, max_damage, max_damage_tank_id, battles, wins, } = data.statistics.all;
    const { account_id, created_at, global_rating, nickname, last_battle_time, } = data;
    return {
        max_xp,
        max_xp_tank_id,
        max_frags,
        max_frags_tank_id,
        max_damage,
        max_damage_tank_id,
        battles,
        wins,
        account_id,
        created_at,
        global_rating,
        nickname,
        last_battle_time,
    };
};
const getStatsAndAchevements = (account_id, mongoAchiev) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://localhost:${process.env.PORT || 3000}/api/player/achievements/${account_id}`;
    const promiseArr = [(0, APICalls_1.getPlayerTanksStats)(account_id)];
    if (!mongoAchiev) {
        promiseArr.push((0, node_fetch_1.default)(url).then((e) => e.json()));
    }
    const tanks = yield Promise.all(promiseArr)
        .then((e) => {
        var _a;
        const tanksStats = e[0].data[account_id];
        const tanksAchev = ((_a = e[1]) === null || _a === void 0 ? void 0 : _a.tanks) || mongoAchiev.tanks;
        if (tanksAchev === null || tanksAchev === void 0 ? void 0 : tanksAchev.length) {
            const stats = tanksAchev.map((tank, i) => {
                const { marksOnGun, tank_id } = tank;
                const stats = tanksStats.find((el) => el.tank_id === tank_id);
                const { mark_of_mastery, max_xp, max_frags } = stats;
                const { xp, damage_dealt, frags, battles, wins } = stats.all;
                return {
                    mark_of_mastery,
                    tank_id,
                    max_xp,
                    max_frags,
                    xp,
                    damage_dealt,
                    frags,
                    battles,
                    wins,
                    marksOnGun,
                };
            });
            return stats;
        }
        return [];
    })
        .catch(() => {
        return { error: "An error has occurred. Try again!" };
    });
    return tanks;
});
