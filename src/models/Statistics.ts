import { IStats } from "IStats";
import mongoose, { Schema } from "mongoose";

const statsModel = new Schema<IStats>(
	{
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
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: false },
		versionKey: false,
	}
);

export default mongoose.model("Statistics", statsModel);
