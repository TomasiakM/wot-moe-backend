import { Request, Response } from "express";
import { ITank } from "ITank";
import Tank from "../models/Tank";
import TankLastUpdate from "../models/TankLastUpdate";
import { getTanksList } from "../scripts/APICalls";

export default async (req: Request, res: Response) => {
	const tanks = await Tank.find({}).lean();

	if (!tanks.length) {
		return res.send(await fetchTanksList(true));
	}

	res.send({ success: true, tanks });

	const weekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
	const lastUpdate = await TankLastUpdate.findOne({
		name: "last_update",
		updated_at: { $gte: weekAgo },
	});
	if (!lastUpdate) fetchTanksList();
};

const fetchTanksList = async (returnData = false) => {
	try {
		const tanks = await getTanksList();

		const tanksList: ITank[] = Object.keys(tanks.data).map((e) => {
			const tank = tanks.data[e];

			const image = tank.images.contour_icon;
			const { tank_id, type, short_name, nation, tier } = tank;

			return { tank_id, type, nation, tier, image, name: short_name };
		});

		const promises = tanksList.map((e) =>
			Tank.updateOne({ tank_id: e.tank_id }, e, { upsert: true })
		);

		await Promise.all(promises).then(async () => {
			await TankLastUpdate.updateOne(
				{ name: "last_update" },
				{ $set: { updated_at: Date.now } },
				{ upsert: true }
			);
		});
		if (returnData) {
			return {
				success: true,
				tanks: await Tank.find({}).lean(),
			};
		}
	} catch (err) {
		if (returnData) {
			return { error: "An error has occurred. Try again!" };
		}
	}
};
