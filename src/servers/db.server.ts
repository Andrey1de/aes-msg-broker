import * as pg from  'pg';
import { Pool,PoolClient } from 'pg';

import {Env} from '../env/env'
class DbServerIternal{
    readonly Pool: pg.Pool;
	readonly DB_CONNECTION_STRING: string = '';
	readonly DB_SCHEMA: string = '';


    constructor(){
		this.DB_CONNECTION_STRING = Env.DB_CONNECTION_STRING;
		this.DB_SCHEMA = Env.DB_SCHEMA;
		if (Env.DB_CONNECTION_STRING) {
			if (Env.IS_HEROKU) {
				pg.defaults.ssl = true;
			}

			this.Pool = new Pool({
				connectionString: this.DB_CONNECTION_STRING,
				max: 20,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 20000,
			});
			console.log(`Connection Pool is set to \n${Env.DB_CONNECTION_STRING}`);
		}

		
	}


}


	export const DbServer: DbServerIternal = new DbServerIternal()