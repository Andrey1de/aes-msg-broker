import express = require('express');

import { PoolClient } from 'pg';

import { Request, Response } from 'express';
import * as S from '../common/http-status';
import {DbServer as DB} from '../servers/db.server';
import {Env} from '../env/env';
import { SqlFactory } from './sql-factory';
import  {StoreDto} from './store-dto'
//import { loggers } from 'winston';
//import { from } from 'rxjs';

enum EGuard {
	Zero = 0,
	Kind = 1,
	Key = 2,
	Body = 4
}
function logSqlRes(verb: string, g:GuardParams , arr:StoreDto[]){
	const strLog = `${verb.toUpperCase()}:${g.toString(verb)}`;
	console.log(strLog);
	if(arr.length > 0){
		console.table(arr);
	}


}

class GuardParams {

	readonly queue: string = undefined!;
	readonly kind: string = undefined!;
	readonly key: string = undefined!;
	readonly body: any = undefined!; //= (req.body.item || req.body);

	private error: string = '';
	get Error(): string { return this.error; }
	private status: number = S.OK;
	get Status(): number { return this.status; }
	toString(verb:string):string{
		const p = this;
		const keyStr = (p.key)?'/'+p.key : '';
		const isBoby = (verb?.toUpperCase() !== 'GET' &&p.body);
		const bodyStr = (isBoby)?`::(${JSON.stringify(p.body)})` : '';
		const str = `[${p.queue}/${p.kind}${keyStr}]${bodyStr}]`;
		return str;
	}
	constructor(private req: Request, private res: Response,
		private flags: EGuard = EGuard.Zero) {
		this.queue = req?.params?.queue.toString() || 'memory';
		this.kind = req?.params?.kind;
		this.key = req?.params?.key;
		this.body = req?.body?.item || req?.body;

	//	this.status = this.validate();

	}
	get OK(): boolean { return this.status == S.OK };

	validate(): number {
		this.error = '';
		this.res.setHeader('content-kind', 'application/json');
		if (!this.req?.params?.queue) {
			this.req.params.queue = 'memory';
		}

		if ((this.flags & EGuard.Kind) && !this.kind) {//(this.flags & EGuard.Type) && this.kind
			this.error += ((this.error) ? ' AND ' : '') + `Bad parameter: kind`;
			this.error = `Bad parameter:kind `;
			this.status = S.BAD_REQUEST;

		}

		if ((this.flags & EGuard.Key) && !this.key) {
			this.status = S.BAD_REQUEST;
			this.error += ((this.error) ? ' AND ' : '') + `Bad parameter: key `;

		}

		if ((this.flags & EGuard.Body) && !this.body) {
			this.status = S.PRECONDITION_FAILED;
			this.error += ((this.error) ? ' AND ' : '') + `Bad parameter: body `;

		}

		if (this.status != S.OK) {
			console.log(this.Error);
			this.res.send(this.Error).status(this.status).end();
		}
		return this.status;

	}

}

export  class StoreController {

    public async Get(req: Request,  res: Response) {
		let Client:PoolClient =undefined!;
        try {

             let p: GuardParams = new GuardParams(req, res, EGuard.Kind | EGuard.Kind);
       
		if (p.validate() != S.OK) {
			return;
		}
      //TODO if p.Key exists = Action on one row
            Client = await DB.Pool.connect();

            const sql = SqlFactory.Get(p.queue,p.kind,p.key);
            const { rows } = await Client.query(sql);
            const todos = rows;
			logSqlRes('GET',p,rows);
            res.send(todos);
        } catch (error) {
            res.status(400).send(error);
        }
		finally{
			Client?.release();
		}
    }
	public async Delete(req: Request,  res: Response) {
		let Client:PoolClient;
        try {

            res.setHeader('content-kind', 'application/json');
            let p: GuardParams = new GuardParams(req, res, EGuard.Kind );
       
		if (p.validate() != S.OK) {
			return;
		}
      //TODO if p.Key exists = Action on one row
            Client = await DB.Pool.connect();

            const sql = SqlFactory.Delete(p.queue,p.kind,p.key);
            const { rows } = await Client.query(sql);
            const todos = rows;
			logSqlRes('DELETE',p,rows);
            res.send(todos);
        } catch (error) {
            res.status(400).send(error);
        }
		finally{
			Client?.release();
		}
    }	
	public async Update(req: Request,  res: Response) {
		let Client:PoolClient;
        try {

               let p: GuardParams = new GuardParams(req, res, EGuard.Kind | EGuard.Key );
       
			if (p.validate() != S.OK) {
				return;
			}

			const body = p.body.data || p.body;
			if (!body.jdata) {
				res.send('the content not present').status(S.NO_CONTENT).end();
		
			}
      //TODO if p.Key exists = Action on one row
             Client = await DB.Pool.connect();
			const row: StoreDto = new StoreDto(body);
			row.kind =  p.kind;
			row.key =  p.key;
			
            const sql = SqlFactory.UpsertRow(p.queue,row);
            const { rows } = await Client.query(sql);
            const todos = rows;
			logSqlRes('UPDATE',p,rows);
  
            res.send(todos); 
        } catch (error) {
            res.status(400).send(error);
        }
		finally{
			Client?.release();
		}
    }
	public async Upsert(req: Request,  res: Response) {
		let Client:PoolClient;
        try {

             let p: GuardParams = new GuardParams(req, res, EGuard.Kind | EGuard.Key );
       
			if (p.validate() != S.OK) {
				return;
			}

			const body = p.body.data || p.body;
			//
      //TODO if p.Key exists = Action on one row
            Client = await DB.Pool.connect();
			const row: StoreDto = new StoreDto(body);
			row.kind =  p.kind;
			row.key =  p.key;
			
            const sql = SqlFactory.UpsertRow(p.queue,row);
            const { rows } = await Client.query(sql);
            const todos = rows;
			logSqlRes('INSERT',p,rows);
  
            res.send(todos); 
        } catch (error) {
            res.status(400).send(error);
        }
		finally{
			Client?.release();
		}
    }
	
}

//export const StoreServer: StoreServerClass = new StoreServerClass()