import { Request, Response } from "express";
import Player from "../models/Player";
import Statistics from "../models/Statistics";

export default async (req: Request, res: Response) => {
	try {
		const lastDay = new Date();
		lastDay.setDate(new Date().getDate() - 1);
		lastDay.setHours(23, 59, 59, 999);

		const stats = await Statistics.findOne({
			created_at: { $gte: lastDay },
		});

		if (!stats) {
			const users = await userCount();
			const marked = await markedTanks();
			const popular = await popularTanks();

			if (!users.data || !marked.data || !popular.data) {
				return res.send({ error: "An error has occurred. Try again!" });
			}

			const { total_players, new_players_last_day } = users.data;
			const newStats = await Statistics.create({
				total_players,
				new_players_last_day,
				marked_tank_top_list: marked.data,
				popular_tanks_top_list: popular.data,
			});

			const savedStats = await newStats.save();

			return res.send({
				success: true,
				statistics: savedStats,
			});
		}

		return res.send({ success: true, statistics: stats });
	} catch (err) {
		return res.send({ error: "An error has occurred. Try again!" });
	}
};

const popularTanks = async () => {
	try {
		const tanks = await Player.aggregate([
			{
				$unwind: "$tanks",
			},
			{
				$group: {
					_id: "$tanks.tank_id",
					tank_id: {
						$first: "$tanks.tank_id",
					},
					amount: {
						$sum: 1,
					},
				},
			},
			{
				$project: {
					_id: 0,
				},
			},
			{
				$sort: {
					amount: -1,
				},
			},
			{
				$limit: 10,
			},
		]);

		return { data: tanks };
	} catch (err) {
		return { error: true };
	}
};

const markedTanks = async () => {
	try {
		const tanks = await Player.aggregate([
			{
				$unwind: "$tanks",
			},
			{
				$match: {
					"tanks.marksOnGun": {
						$eq: 3,
					},
				},
			},
			{
				$group: {
					_id: "$tanks.tank_id",
					tank_id: {
						$first: "$tanks.tank_id",
					},
					amount: {
						$sum: 1,
					},
				},
			},
			{
				$sort: {
					amount: -1,
				},
			},

			{ $limit: 10 },
			{ $project: { _id: 0, tank_id: 1, amount: 1 } },
		]);

		return { data: tanks };
	} catch (err) {
		return { error: true };
	}
};

const userCount = async () => {
	try {
		const dayStart = new Date();
		const dayEnd = new Date();

		dayStart.setDate(new Date().getDate() - 1);
		dayStart.setHours(0, 0, 0, 0);

		dayEnd.setDate(new Date().getDate() - 1);
		dayEnd.setHours(23, 59, 59, 999);

		const users = await Player.aggregate([
			{
				$group: {
					_id: null,
					total_players: {
						$sum: 1,
					},
					new_players_last_day: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ["$created_at", dayStart] },
										{ $lte: ["$created_at", dayEnd] },
									],
								},
								1,
								0,
							],
						},
					},
				},
			},
			{
				$project: { _id: 0 },
			},
		]);

		return { data: users[0] };
	} catch (err) {
		return { error: true };
	}
};
