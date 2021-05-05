///
///	IMPORTANT SYSTEM VARIABLES heve setters for Application
///

export var PORT: number = 3000;
export function set_PORT(val: number) { PORT = val;}
export var DB_SCHEMA: string = 'public';
export function set_DB_SCHEMA(val: string) { DB_SCHEMA = val; }
export var DB_CONNECTION_STRING = '';
export function set_DB_CONNECTION_STRING(val: string) { DB_CONNECTION_STRING  = val; }
export var IS_HEROKU: boolean = false;;
export function set_IS_HEROKU(val: boolean) { IS_HEROKU = val; }


import * as pg from 'pg';


export var Pool: pg.Pool = undefined;

export function set_Pool(pool: pg.Pool) {
	Pool = pool;

}


