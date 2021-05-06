import { PoolClient } from "pg";
import { SqlFactory } from "./sql-factory";
import { StoreDto } from "./store-dto";
import * as Env from '../enviro/enviro';
import { StoreCahche } from "./store-cache";


class SqlTaskProcessor {
	public readonly isUpsert
	constructor(public readonly verb: string,
		public readonly sql: string,
		public readonly Store: StoreCahche
			) {
		this.verb = this.verb.toUpperCase();
		this.isUpsert = verb !== 'DELETE';
	}
	logSqlRes(arr: StoreDto[]) {
		const strLog = `${this.verb}:${this.sql}`;
		console.log(strLog);
		if (arr.length > 0) {
			console.table(arr);
		}


	}

	async Do() {
		var Client: PoolClient = undefined!;
		var rowsRet: StoreDto[] = [];
		try {
				Client = await Env.Pool.connect();

				const { rows } = await Client.query(this.sql);

				rowsRet = rows?.map(r => {
					let row = new StoreDto(r);
					if (this.isUpsert) {
						this.Store.setItemR(row);
					} else {
						this.Store.removeItemR(row);

					}
						return row;
				}) || [];

			}
			this.logSqlRes(rowsRet);
			if (verb == 'INSERT') {

			}
				if (rowsRet.length > 0) {
				res.send(rowsRet).status(S.OK).end();
			} else {
				res.send(rowsRet).sendStatus(S.NOT_FOUND).end();

			}

			//TODO if p.Key exists = Action on one row
		} catch (error) {
			res.status(400).send(error);
		}
		finally {
			Client?.release();
		}
	}
}