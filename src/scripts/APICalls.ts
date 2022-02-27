import fetch from "node-fetch";

const findPlayerByName = async (name: string) => {
	const url = `https://api.worldoftanks.eu/wot/account/list/?application_id=${process.env.API_KEY}&search=${name}`;

	return await fetch(url).then((e) => e.json());
};

const findClanByName = async (name: string) => {
	const url = `https://api.worldoftanks.eu/wot/clans/list/?application_id=${process.env.API_KEY}&search=${name}`;

	return await fetch(url).then((e) => e.json());
};

const findPlayerById = async (account_id: number) => {
	const url = `https://api.worldoftanks.eu/wot/account/info/?application_id=${process.env.API_KEY}&account_id=${account_id}`;

	return await fetch(url).then((e) => e.json());
};

const findClanById = async (clan_id: number) => {
	const url = `https://api.worldoftanks.eu/wot/clans/info/?application_id=${process.env.API_KEY}&clan_id=${clan_id}`;

	return await fetch(url).then((e) => e.json());
};

const getPlayerTanksStats = async (account_id: number) => {
	const url = `https://api.worldoftanks.eu/wot/tanks/stats/?application_id=${process.env.API_KEY}&account_id=${account_id}`;

	return await fetch(url).then((e) => e.json());
};

const getPlayerTanksAchevements = async (account_id: number) => {
	const url = `https://api.worldoftanks.eu/wot/tanks/achievements/?application_id=${process.env.API_KEY}&account_id=${account_id}`;

	return await fetch(url).then((e) => e.json());
};

const getTanksList = async () => {
	const url = `https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=${process.env.API_KEY}`;

	return await fetch(url).then((e) => e.json());
};

export {
	findPlayerByName,
	findClanByName,
	findPlayerById,
	findClanById,
	getPlayerTanksStats,
	getPlayerTanksAchevements,
	getTanksList,
};
