"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const statsModel = new mongoose_1.Schema({
    total_players: {
        type: Number,
        required: true,
    },
    new_players_last_day: {
        type: Number,
        required: true,
    },
    marked_tank_top_list: [
        {
            _id: false,
            tank_id: { type: Number, required: true },
            amount: { type: Number, required: true },
        },
    ],
    popular_tanks_top_list: [
        {
            _id: false,
            tank_id: { type: Number, required: true },
            amount: { type: Number, required: true },
        },
    ],
}, {
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false,
});
exports.default = mongoose_1.default.model("Statistics", statsModel);
