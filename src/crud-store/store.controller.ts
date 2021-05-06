import { Request, Response } from 'express';
import * as S from '../common/http-status';
import { SqlFactory } from './sql-factory';
import  {StoreDto} from './store-dto'
import { StoreRequestHandler } from './store-request-handler';
import { EGuard } from './e-guard';
import { TaskMachine} from './task-machine'



export class StoreController {

	
	public async Get$(req: Request, res: Response) {
		var rowsRet: StoreDto[] = [];
		try {

			let p: StoreRequestHandler = new StoreRequestHandler(req, res,
				'GET',EGuard.Kind | EGuard.Kind);

			if (p.Validate() != S.OK) {
				return;
			}
			if (p.db) {
				rowsRet = p.Store.getMany(p.kind, p.key);
			} else {
				p.sql = SqlFactory.Get(p.queue, p.kind, p.key);

				await p.Run$();

				p.Dump();
				rowsRet = p.RowsResult;
			}
		
			if (rowsRet.length > 0) {
				res.send(rowsRet).status(S.OK).end();
			} else {
				res.send(rowsRet).sendStatus(S.NOT_FOUND).end();

			}

		} catch (error) {
			res.status(400).send(error);
		}
	}

	///============================================================
	///	Deletes one row or if uuser has admin rights many row 
	/// by low of Get
	/// Returns old deleted rows;
	//==============================================================

	public async Delete$(req: Request, res: Response) {
		var rowsOld: StoreDto[] = [];
		
		try {

			let p: StoreRequestHandler = new StoreRequestHandler(req, res,
				'DELETE',EGuard.Kind | EGuard.Kind);
			rowsOld = p.Store.getMany(p.kind, p.key);

			if (p.Validate() != S.OK) {
				return;
			}
			if (!p.isAdmin && !p.oneRow) {
				res.send('Tis user has no acess rights for group DELETE operation')
					.sendStatus(S.FORBIDDEN).end();
				return;
			}
			if (rowsOld.length > 0) {
				res.send(rowsOld).status(S.OK).end();
			} else {
				res.sendStatus(S.NOT_FOUND).end();
  			}

			p.sql = SqlFactory.Delete(p.queue, p.kind, p.key);
			TaskMachine.EnqueueTask(p);
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

	public async Insert$(req: Request, res: Response) {

		let p: StoreRequestHandler = new StoreRequestHandler(req, res,
			'INSERT', EGuard.Kind | EGuard.Kind | EGuard.Key | EGuard.Body);

		if (p.Validate() != S.OK) {
			return;
		}
		const old = p.Store.setItem(p.kind, p.key, p.row);

		const status = (old) ? S.CREATED : S.OK;

		res.send([p.row]).sendStatus(status).end();
		p.sql = SqlFactory.UpsertRow(p.queue, p.row);
		TaskMachine.EnqueueTask(p);

	}

	public async Update$(req: Request, res: Response) {

		let p: StoreRequestHandler = new StoreRequestHandler(req, res,
			'UPDATE', EGuard.Kind | EGuard.Kind | EGuard.Key | EGuard.Body);

		if (p.Validate() != S.OK) {
			return;
		}
		const old = p.Store.setItem(p.kind, p.key, p.row);

		const status = (old) ? S.CREATED : S.OK;
	   //This is more relaible to use Upsert !!!!
		p.sql = SqlFactory.UpsertRow(p.queue, p.row);
		TaskMachine.EnqueueTask(p);
		res.send([p.row]).sendStatus(status).end();

	}

}

//export const StoreServer: StoreServerClass = new StoreServerClass()