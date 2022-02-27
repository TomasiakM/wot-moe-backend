import { Request, Response } from "express";
import fetch from "node-fetch";
import Player from "../models/Player";
import { findClanByName, findClanById } from "../scripts/APICalls";

export default async (req: Request, res: Response) => {
	try {
		const { name } = req.params;
		const clan = await findClanByName(name);

		if (clan.data.length === 0) {
			return res.send({ clanNotFound: true });
		}

		const { clan_id } = clan.data[0];
		const clanData = await findClanById(clan_id);

		const members = await membersAcheves(clanData.data[clan_id].members);

		if (members.error) {
			return res.send(members);
		}

		let marksList = {
			3: {} as { [key: string]: number },
			2: {} as { [key: string]: number },
			1: {} as { [key: string]: number },
		};

		const data = members.data!.map((member) => {
			const moe = { 3: 0, 2: 0, 1: 0 };
			member.tanks.forEach((tank) => {
				const { marksOnGun, tank_id } = tank;
				if (marksOnGun) {
					moe[marksOnGun]++;

					if (marksOnGun) {
						if (!marksList[marksOnGun][tank_id])
							marksList[marksOnGun][tank_id] = 0;
						marksList[marksOnGun][tank_id]++;
					}
				}
			});
			const { account_id, account_name } = member;
			return { account_id, account_name, moe };
		});

		const marks = {
			3: Object.keys(marksList[3]).map((tank_id) => {
				return { tank_id, amount: marksList[3][tank_id] };
			}),
			2: Object.keys(marksList[2]).map((tank_id) => {
				return { tank_id, amount: marksList[2][tank_id] };
			}),
			1: Object.keys(marksList[1]).map((tank_id) => {
				return { tank_id, amount: marksList[1][tank_id] };
			}),
		};

		res.send({
			success: true,
			data: {
				...convertClanData(clanData.data[clan_id]),
				members: data,
				marks,
			},
		});
	} catch (err) {
		res.send({ error: "An error has occurred. Try again!" });
	}
};

const convertClanData = (data: any) => {
	const { name, tag, description_html, color, clan_id } = data;
	const logo = data.emblems.x195.portal;

	return {
		name,
		tag,
		description_html,
		color,
		clan_id,
		logo,
	};
};

const membersAcheves = async (
	members: ClanMember[]
): Promise<MembersAcheves> => {
	const membersID = members.map((e) => e.account_id);

	const dayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
	const dbResult = await Player.find({
		account_id: { $in: membersID },
		updated_at: { $gte: dayAgo },
	});

	const accountFromDB = dbResult.map((e) => e.account_id);
	const accountsToFetch = membersID.filter((e) => !accountFromDB.includes(e));

	const fetchArr = accountsToFetch.map((account_id) =>
		fetch(
			`http://localhost:${
				process.env.PORT || 3000
			}/api/player/achievements/${account_id}`
		).then((e) => e.json())
	);

	const fetchResult: PromiseResult = await Promise.all(fetchArr)
		.then(async (e) => {
			if (e.find((player) => player.error)) {
				return { error: "An error has occurred. Try again!" };
			}

			return {
				data: e.map((player) => {
					const { tanks, account_id } = player;
					const filterTanks = tanks.filter(
						(tank: any) => tank.marksOnGun !== 0
					);
					return { account_id, tanks: filterTanks };
				}),
			};
		})
		.catch((err) => {
			return { error: "An error has occurred. Try again!" };
		});

	if (fetchResult.error) {
		const { error } = fetchResult;
		return { error };
	}

	const finalRes = [...fetchResult.data!, ...dbResult].map((account) => {
		const { account_id, tanks } = account;
		const { account_name } = members.find(
			(e) => e.account_id === account_id
		)!;

		return { account_id, account_name, tanks };
	});

	return { data: finalRes };
};

interface MembersAcheves {
	error?: string;
	data?: {
		account_id: number;
		account_name: string;
		tanks: {
			tank_id: number;
			marksOnGun: 3 | 2 | 1 | 0;
		}[];
	}[];
}

interface PromiseResult {
	error?: string;
	data?: {
		account_id: number;
		tanks:
			| {
					tank_id: number;
					marksOnGun: 3 | 2 | 1 | 0;
			  }[];
	}[];
}

interface ClanMember {
	role: string;
	role_i18n: string;
	joined_at: number;
	account_id: number;
	account_name: string;
}
