import mongoose, { Schema } from "mongoose";

interface ITankLastUpdate {
	name: string;
	updated_at: number;
}

const tankLastUpdateSchema = new Schema<ITankLastUpdate>(
	{
		name: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: { createdAt: false, updatedAt: "updated_at" },
		versionKey: false,
	}
);

export default mongoose.model("TankLastUpdate", tankLastUpdateSchema);
