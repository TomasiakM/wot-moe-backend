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
exports.getTanksList = exports.getPlayerTanksAchevements = exports.getPlayerTanksStats = exports.findClanById = exports.findPlayerById = exports.findClanByName = exports.findPlayerByName = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const findPlayerByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.worldoftanks.eu/wot/account/list/?application_id=${process.env.API_KEY}&search=${name}`;
    return yield (0, node_fetch_1.default)(url).then((e) => e.json());
});
exports.findPlayerByName = findPlayerByName;
const findClanByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.worldoftanks.eu/wot/clans/list/?application_id=${process.env.API_KEY}&search=${name}`;
    return yield (0, node_fetch_1.default)(url).then((e) => e.json());
});
exports.findClanByName = findClanByName;
const findPlayerById = (account_id) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.worldoftanks.eu/wot/account/info/?application_id=${process.env.API_KEY}&account_id=${account_id}`;
    return yield (0, node_fetch_1.default)(url).then((e) => e.json());
});
exports.findPlayerById = findPlayerById;
const findClanById = (clan_id) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.worldoftanks.eu/wot/clans/info/?application_id=${process.env.API_KEY}&clan_id=${clan_id}`;
    return yield (0, node_fetch_1.default)(url).then((e) => e.json());
});
exports.findClanById = findClanById;
const getPlayerTanksStats = (account_id) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.worldoftanks.eu/wot/tanks/stats/?application_id=${process.env.API_KEY}&account_id=${account_id}`;
    return yield (0, node_fetch_1.default)(url).then((e) => e.json());
});
exports.getPlayerTanksStats = getPlayerTanksStats;
const getPlayerTanksAchevements = (account_id) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.worldoftanks.eu/wot/tanks/achievements/?application_id=${process.env.API_KEY}&account_id=${account_id}`;
    return yield (0, node_fetch_1.default)(url).then((e) => e.json());
});
exports.getPlayerTanksAchevements = getPlayerTanksAchevements;
const getTanksList = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=${process.env.API_KEY}`;
    return yield (0, node_fetch_1.default)(url).then((e) => e.json());
});
exports.getTanksList = getTanksList;
