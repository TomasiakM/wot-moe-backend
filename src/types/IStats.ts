export interface IStats {
	total_players: number;
	new_players_last_day: number;
	marked_tank_top_list: [
		{
			tank_id: number;
			amount: number;
		}
	];
	popular_tanks_top_list: [
		{
			tank_id: number;
			amount: number;
		}
	];
	created_at: number;
}
