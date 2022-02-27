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
const Tank_1 = __importDefault(require("../models/Tank"));
const TankLastUpdate_1 = __importDefault(require("../models/TankLastUpdate"));
const APICalls_1 = require("../scripts/APICalls");
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tanks = yield Tank_1.default.find({}).lean();
    if (!tanks.length) {
        return res.send(yield fetchTanksList(true));
    }
    res.send({ success: true, tanks });
    const weekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    const lastUpdate = yield TankLastUpdate_1.default.findOne({
        name: "last_update",
        updated_at: { $gte: weekAgo },
    });
    if (!lastUpdate)
        fetchTanksList();
});
const fetchTanksList = (returnData = false) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tanks = yield (0, APICalls_1.getTanksList)();
        const tanksList = Object.keys(tanks.data).map((e) => {
            const tank = tanks.data[e];
            const image = tank.images.contour_icon;
            const { tank_id, type, short_name, nation, tier } = tank;
            return { tank_id, type, nation, tier, image, name: short_name };
        });
        const promises = tanksList.map((e) => Tank_1.default.updateOne({ tank_id: e.tank_id }, e, { upsert: true }));
        yield Promise.all(promises).then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield TankLastUpdate_1.default.updateOne({ name: "last_update" }, { $set: { updated_at: Date.now } }, { upsert: true });
        }));
        if (returnData) {
            return {
                success: true,
                tanks: yield Tank_1.default.find({}).lean(),
            };
        }
    }
    catch (err) {
        if (returnData) {
            return { error: "An error has occurred. Try again!" };
        }
    }
});
