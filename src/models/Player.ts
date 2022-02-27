import mongoose, { Schema } from "mongoose";
import { IPlayer } from "IPlayer";

const playerSchema = new Schema<IPlayer>(
	{
		account_id: {
			type: Number,
			requred: true,
			unique: true,
		},
		tanks: [
			{
				_id: false,
				tank_id: {
					type: Number,
					required: true,
				},
				marksOnGun: {
					type: Number,
					required: true,
				},
			},
		],
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
		versionKey: false,
	}
);

export default mongoose.model("Player", playerSchema);
