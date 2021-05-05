
import * as dotenv from 'dotenv';
import { convertCompilerOptionsFromJson } from 'typescript';

class EnvInternal {

	readonly IS_HEROKU: boolean = false;
	readonly DB_CONNECTION_STRING: string = '';
	readonly DB_SCHEMA : string;
	readonly PORT : number;


	constructor() {

		//IMPOT : Normalization of the Port Instance
		const port = +process.env.PORT;
		dotenv.config();
		if(port){
			process.env.PORT = port.toString();	
		}
		this.PORT = +process.env.PORT || 3000;
		process.env.PORT = this.PORT.toString();
		
		this.DB_SCHEMA = process.env.DB_SCHEMA || 'public';
		this.IS_HEROKU = (process.env['IS_HEROKU'] || '').toUpperCase() == 'TRUE';
		this.DB_CONNECTION_STRING = (this.IS_HEROKU) ? process.env.DATABASE_URL :
			process.env.LOCAL_POSTGRESS_CONNECTION_STRING;
		console.log(`IS_HEROKU::${this.IS_HEROKU}\n::Env(DB_:: ${this.DB_CONNECTION_STRING})` )
			//'postgresql://postgres:1q1q@127.0.0.1:5432/clouddata';
	}
}

export const Env: EnvInternal = new EnvInternal();

