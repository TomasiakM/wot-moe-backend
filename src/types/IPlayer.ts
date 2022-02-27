export type IPlayer = {
	account_id: number;
	tanks: [
		{
			tank_id: number;
			marksOnGun: 3 | 2 | 1 | 0;
		}
	];
	created_at: number;
	updated_at: number;
};
