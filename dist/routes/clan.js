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
const node_fetch_1 = __importDefault(require("node-fetch"));
const Player_1 = __importDefault(require("../models/Player"));
const APICalls_1 = require("../scripts/APICalls");
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        const clan = yield (0, APICalls_1.findClanByName)(name);
        if (clan.data.length === 0) {
            return res.send({ clanNotFound: true });
        }
        const { clan_id } = clan.data[0];
        const clanData = yield (0, APICalls_1.findClanById)(clan_id);
        const members = yield membersAcheves(clanData.data[clan_id].members);
        if (members.error) {
            return res.send(members);
        }
        let marksList = {
            3: {},
            2: {},
            1: {},
        };
        const data = members.data.map((member) => {
            const moe = { 3: 0, 2: 0, 1: 0 };
            member.tanks.forEach((tank) => {
                const { marksOnGun, tank_id } = tank;
                if (marksOnGun) {
                    moe[marksOnGun]++;
                    if (marksOnGun) {
                        if (!marksList[marksOnGun][tank_id])
                            marksList[marksOnGun][tank_id] = 0;
                        marksList[marksOnGun][tank_id]++;
                    }
                }
            });
            const { account_id, account_name } = member;
            return { account_id, account_name, moe };
        });
        const marks = {
            3: Object.keys(marksList[3]).map((tank_id) => {
                return { tank_id, amount: marksList[3][tank_id] };
            }),
            2: Object.keys(marksList[2]).map((tank_id) => {
                return { tank_id, amount: marksList[2][tank_id] };
            }),
            1: Object.keys(marksList[1]).map((tank_id) => {
                return { tank_id, amount: marksList[1][tank_id] };
            }),
        };
        res.send({
            success: true,
            data: Object.assign(Object.assign({}, convertClanData(clanData.data[clan_id])), { members: data, marks }),
        });
    }
    catch (err) {
        res.send({ error: "An error has occurred. Try again!" });
    }
});
const convertClanData = (data) => {
    const { name, tag, description_html, color, clan_id } = data;
    const logo = data.emblems.x195.portal;
    return {
        name,
        tag,
        description_html,
        color,
        clan_id,
        logo,
    };
};
const membersAcheves = (members) => __awaiter(void 0, void 0, void 0, function* () {
    const membersID = members.map((e) => e.account_id);
    const dayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
    const dbResult = yield Player_1.default.find({
        account_id: { $in: membersID },
        updated_at: { $gte: dayAgo },
    });
    const accountFromDB = dbResult.map((e) => e.account_id);
    const accountsToFetch = membersID.filter((e) => !accountFromDB.includes(e));
    const fetchArr = accountsToFetch.map((account_id) => (0, node_fetch_1.default)(`http://localhost:${process.env.PORT || 3000}/api/player/achievements/${account_id}`).then((e) => e.json()));
    const fetchResult = yield Promise.all(fetchArr)
        .then((e) => __awaiter(void 0, void 0, void 0, function* () {
        if (e.find((player) => player.error)) {
            return { error: "An error has occurred. Try again!" };
        }
        return {
            data: e.map((player) => {
                const { tanks, account_id } = player;
                const filterTanks = tanks.filter((tank) => tank.marksOnGun !== 0);
                return { account_id, tanks: filterTanks };
            }),
        };
    }))
        .catch((err) => {
        return { error: "An error has occurred. Try again!" };
    });
    if (fetchResult.error) {
        const { error } = fetchResult;
        return { error };
    }
    const finalRes = [...fetchResult.data, ...dbResult].map((account) => {
        const { account_id, tanks } = account;
        const { account_name } = members.find((e) => e.account_id === account_id);
        return { account_id, account_name, tanks };
    });
    return { data: finalRes };
});
