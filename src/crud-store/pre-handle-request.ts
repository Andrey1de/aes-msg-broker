import { Response } from "express";
import { Request } from "express";
import * as S from '../common/http-status';
import { EGuard } from "./e-guard";
import { GlobalGetMapSore, StoreCahche } from "./store-cache";
import { StoreDto } from "./store-dto";

export class PreHandleRequest {

	//readonly verb: string = undefined!;
	readonly queue: string = undefined!;
	readonly kind: string = undefined!;
	readonly key: string = undefined!;
	readonly db: boolean = false!;
	readonly isAdmin: boolean = false!;
	readonly oneRow: boolean = false!;
	private readonly body: any = undefined!; //= (req.body.item || req.body);
	readonly row: StoreDto = undefined!; //= (req.body.item || req.body);
	readonly Store: StoreCahche;

	private error: string = '';
	get Error(): string { return this.error; }
	private status: number = S.OK;
	get Status(): number { return this.status; }
	toString(verb: string): string {
		const p = this;
		const keyStr = (p.key) ? '/' + p.key : '';
		const isBoby = (verb?.toUpperCase() !== 'GET' && p.body);
		const bodyStr = (isBoby) ? `::(${JSON.stringify(p.body)})` : '';
		const str = `[${p.queue}/${p.kind}${keyStr}]${bodyStr}]`;
		return str;
	}
	constructor(private req: Request, private res: Response,
		public readonly verb : string,
		public readonly flags: EGuard = EGuard.Zero) {
		this.queue = req.params?.queue.toString() || 'memory';
		this.kind = req.params?.kind || '';
		this.key = req.params?.key || '';
		this.body = req.body?.item || req.body;
		const strDb = (req.query?.db || '').toLocaleString();
		this.db = strDb === '1' || strDb.startsWith('y') || strDb.startsWith('t');
		const strAdmin = (req.query?.admin || '').toLocaleString();
		this.isAdmin = strDb === 'admin' || strDb === 'kuku-ja-chajnik';
		this.Store = GlobalGetMapSore(this.queue);
		this.oneRow = !!this.key;
		if (this.oneRow) {
			let bodyValid: boolean = (this.body && this.body.jdata)
			this.row = new StoreDto(undefined);
			this.row.key = this.key;
			this.row.kind = this.kind;
			this.row.stored = this.row?.stored || new Date();
			this.row.store_to = this.row?.store_to || new Date('2100-01-01');
			this.row.jdata = this.body?.jdata || { "item": "" };

		}
	
		//	this.status = this.validate();

	}
	get OK(): boolean { return this.status == S.OK };

	validate(): number {
		this.error = '';
		this.res.setHeader('content-kind', 'application/json');
		if (!this.req.params?.queue) {
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

