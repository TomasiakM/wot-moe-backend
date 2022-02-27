import { ITank } from "ITank";
import mongoose, { Schema } from "mongoose";

const tankSchema = new Schema<ITank>(
	{
		tank_id: {
			type: Number,
			required: true,
			unique: true,
		},
		image: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		nation: {
			type: String,
			required: true,
		},
		tier: {
			type: Number,
			required: true,
		},
	},
	{
		versionKey: false,
	}
);

export default mongoose.model("Tank", tankSchema);
