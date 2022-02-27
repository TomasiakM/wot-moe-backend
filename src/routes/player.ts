import { Router } from "express";
import { IPlayer } from "IPlayer";
import fetch from "node-fetch";
import Player from "../models/Player";
import {
	getPlayerTanksAchevements,
	getPlayerTanksStats,
	findClanById,
	findPlayerByName,
	findPlayerById,
} from "../scripts/APICalls";

const queue = require("express-queue");

const router = Router();

router.get("/:name", async (req, res) => {
	try {
		const { name } = req.params;
		const player = await findPlayerByName(name);

		if (player.data?.length === 0) {
			return res.send({ playerNotFound: true });
		}

		const { account_id } = player.data[0];
		const playerData = await findPlayerById(account_id);
		const { clan_id } = playerData.data[account_id];

		let clan = null;
		if (clan_id) {
			const clanData = await findClanById(clan_id);
			clan = convertClanData(clanData.data[clan_id]);
		}

		const dayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
		const mongoAchiev = await Player.findOne({
			account_id,
			updated_at: { $gte: dayAgo },
		});

		const tanks = await getStatsAndAchevements(account_id, mongoAchiev);
		if (tanks.error) return res.send(tanks);

		return res.send({
			success: true,
			data: {
				...convertPlayerData(playerData.data[account_id]),
				clan,
				tanks,
			},
		});
	} catch (err) {
		res.send({ error: "An error has occurred. Try again!" });
	}
});

router.get(
	"/achievements/:account_id",
	queue({ activeLimit: 10 }),
	async (req, res) => {
		try {
			const account_id = Number(req.params.account_id);
			const tanksData = await getPlayerTanksAchevements(account_id);
			const playerTanks = tanksData.data[account_id];

			let tanks = [];
			if (playerTanks?.length) {
				tanks = playerTanks.map((e: any) => {
					const { marksOnGun = 0 } = e.achievements;
					const { tank_id } = e;
					return { tank_id, marksOnGun };
				});
			}

			await Player.updateOne(
				{ account_id },
				{ account_id, tanks },
				{ upsert: true }
			);

			res.send({ account_id, tanks });
		} catch (err) {
			res.send({ error: "An error has occurred. Try again!" });
		}
	}
);

export default router;

const convertClanData = (data: any) => {
	const { name, tag, color, clan_id } = data;
	const logo = data.emblems.x195.portal;

	return {
		name,
		tag,
		color,
		clan_id,
		logo,
	};
};

const convertPlayerData = (data: any) => {
	const {
		max_xp,
		max_xp_tank_id,
		max_frags,
		max_frags_tank_id,
		max_damage,
		max_damage_tank_id,
		battles,
		wins,
	} = data.statistics.all;

	const {
		account_id,
		created_at,
		global_rating,
		nickname,
		last_battle_time,
	} = data;

	return {
		max_xp,
		max_xp_tank_id,
		max_frags,
		max_frags_tank_id,
		max_damage,
		max_damage_tank_id,
		battles,
		wins,
		account_id,
		created_at,
		global_rating,
		nickname,
		last_battle_time,
	};
};

const getStatsAndAchevements = async (
	account_id: number,
	mongoAchiev: IPlayer | null
) => {
	const url = `http://localhost:${
		process.env.PORT || 3000
	}/api/player/achievements/${account_id}`;

	const promiseArr = [getPlayerTanksStats(account_id)];
	if (!mongoAchiev) {
		promiseArr.push(fetch(url).then((e) => e.json()));
	}

	const tanks = await Promise.all(promiseArr)
		.then((e) => {
			const tanksStats = e[0].data[account_id];
			const tanksAchev = e[1]?.tanks || mongoAchiev!.tanks;

			if (tanksAchev?.length) {
				const stats = tanksAchev.map((tank: any, i: number) => {
					const { marksOnGun, tank_id } = tank;
					const stats = tanksStats.find(
						(el: any) => el.tank_id === tank_id
					);

					const { mark_of_mastery, max_xp, max_frags } = stats;
					const { xp, damage_dealt, frags, battles, wins } =
						stats.all;

					return {
						mark_of_mastery,
						tank_id,
						max_xp,
						max_frags,
						xp,
						damage_dealt,
						frags,
						battles,
						wins,
						marksOnGun,
					};
				});

				return stats;
			}
			return [];
		})
		.catch(() => {
			return { error: "An error has occurred. Try again!" };
		});

	return tanks;
};
