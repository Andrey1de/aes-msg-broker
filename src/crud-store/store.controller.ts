import express = require('express');



import { Request, Response } from 'express';
import * as S from '../common/http-status';
import * as Env from '../enviro/enviro';
import { SqlFactory } from './sql-factory';
import  {StoreDto} from './store-dto'
//import { loggers } from 'winston';
//import { from } from 'rxjs';
import * as pg from 'pg';
import { Pool, PoolClient } from 'pg';
import { PreHandleRequest } from './pre-handle-request';
import { EGuard } from './e-guard';


function logSqlRes(verb: string, p:PreHandleRequest , arr:StoreDto[]){
	const strLog = `${verb.toUpperCase()}:${p.toString(verb)}`;
	console.log(strLog);
	if(arr.length > 0){
		console.table(arr);
	}


}


export class StoreController {

	//public static readonly Pool: pg.Pool = und;


	public async Get(req: Request, res: Response) {
		var Client: PoolClient = undefined!;
		var rowsRet: StoreDto[] = [];
		try {

			let p: PreHandleRequest = new PreHandleRequest(req, res,
				'GET',EGuard.Kind | EGuard.Kind);

			if (p.validate() != S.OK) {
				return;
			}
			if (p.db) {
				rowsRet = p.Store.getMany(p.kind, p.key);
			} else {
				Client = await Env.Pool.connect();

				const sql = SqlFactory.Get(p.queue, p.kind, p.key);
				const { rows } = await Client.query(sql);
				
				rowsRet = rows?.map(r => {
					let row = new StoreDto(r);
					p.Store.setItemR(row);
					return row;
				}) || [];

			}
			logSqlRes('GET', p, rowsRet);
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

	///============================================================
	///	Deletes one row or if uuser has admin rights many row 
	/// by low of Get
	/// Returns old deleted rows;
	//==============================================================

	public async Delete(req: Request, res: Response) {
		var Client: PoolClient = undefined!;
		var rowsOldRetCached: StoreDto[] = [];
		var rowsRet: StoreDto[] = [];

		try {

			let p: PreHandleRequest = new PreHandleRequest(req, res,
				'DELETE',EGuard.Kind | EGuard.Kind);
			rowsOldRetCached = p.Store.getMany(p.kind, p.key);

			if (p.validate() != S.OK) {
				return;
			}
			if (!p.isAdmin && !p.oneRow) {
				res.send('User has no acess rights for group DELETE operation')
					.sendStatus(S.FORBIDDEN).end();
				return;
			}
			//TBD delete allways done on

			Client = await Env.Pool.connect();


			const sql = SqlFactory.Get(p.queue, p.kind, p.key);
			const { rows } = await Client.query(sql);

			rowsRet = rows?.map(r => {
				let row = new StoreDto(r);
				p.Store.removeItemR(row);
				return row;
			});

			//For synchro only !!!!	may be odd operation but need

			rowsOldRetCached?.forEach(r => p.Store.removeItemR(r));

			logSqlRes('DELETE', p, rowsRet);
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
	///============================================================
	///	Inserts one row or if uuser has admin rights many row 
	/// by low of Get
	/// Returns old deleted rows;
	//==============================================================

	public async Insert(req: Request, res: Response) {
	
		let p: PreHandleRequest = new PreHandleRequest(req, res,
			'INSERT', EGuard.Kind | EGuard.Kind | EGuard.Key | EGuard.Body);

		if (p.validate() != S.OK) {
			return;
		}
		const old = p.Store.setItem(p.kind, p.key, p.row);

		const status = (old) ? S.CREATED : S.OK;

		res.send([p.row]).sendStatus(status).end();

		try {				//TBD delete allways done on

			Client = await Env.Pool.connect();


			const sql = SqlFactory.UpsertRow(p.queue, p.row);
			const { rows } = await Client.query(sql);
			const rowsRet: StoreDto[] = rows?.map(r => {
				let row = new StoreDto()
			});
			let status: number = 0;
			if (rows && rows.length > 0) {
				rowRet = rows[0];
				}

		
			logSqlRes('INSERT', p, rowsRet);
		
			//TODO if p.Key exists = Action on one row
		} catch (error) {
			res.status(400).send(error);
		}
		finally {
			Client?.release();
		}
	}

}

//export const StoreServer: StoreServerClass = new StoreServerClass()