//import cors = require('cors');

import  * as express from 'express';
import { Express } from 'express';
    
import * as path from 'path';
import { StoreRouter }  from '../routes/store.route';
import { EnvRouter } from '../routes/env.route';
//import { RootRouter } from '../routes/root.route';
import { LoggerRouter } from '../routes/logger.route';

//import express = require('express');


import * as dotenv from 'dotenv';

import { Logger } from "../logger/logger";
import * as pg from 'pg';

import * as Env from '../enviro/enviro'
// import * as S from './common/http-status';
// import { Request, Response } from 'express';

///
///  App server supplies the order of initialzation
///

export class AppServer{

    
   // readonly Env: DbServer;
    constructor(readonly app: Express | undefined) {
        this.envConfig();
         this.app = this.app || express();
        this.appConfig();
        this.dbConnect();
        this.routerConfig();
    
      
    }
   
    private envConfig ()    {
    //IMPOT : Normalization of the Port Instance
        const port0 = +(process.env.PORT || 0);
        dotenv.config();
          //First of all External port , after tgis in .env after 3000
        const port = (port0 != 0) ? port0 : (+process.env.PORT || 3000);
        Env.set_PORT(port);
        Env.set_DB_SCHEMA(process.env.DB_SCHEMA || 'public');
        //OR 
        const connString = process.env.DATABASE_URL ||
            process.env.POSTGRESS_LOCAL_CONNECTION_STRING;
        Env.set_DB_CONNECTION_STRING(connString);
        
         const is_heroku: boolean = (process.env.IS_HEROKU == 'YES') ||
        (!process.env.IS_HEROKU && !process.env.POSTGRESS_LOCAL_CONNECTION_STRING)

        Env.set_IS_HEROKU(is_heroku)

        console.log(`IS_HEROKU::${Env.IS_HEROKU}\n::Env(DB_:: ${Env.DB_CONNECTION_STRING})`)
		    //'postgresql://postgres:1q1q@127.0.0.1:5432/clouddata';

      
    }

    private appConfig() {
      
       // this.app.use(cors());
        this.app.use(express.json({ limit: '1mb' })); // 100kb default
        this.app.use(express.text());
        this.app.use(express.urlencoded({ extended: true }));
  
    }

    private dbConnect() {
        if (Env.DB_CONNECTION_STRING) {
            if (Env.IS_HEROKU) {
                pg.defaults.ssl = true;
            }

        }
        const pool = new pg.Pool({
            connectionString: Env.DB_CONNECTION_STRING,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 20000,
        });

        Env.set_Pool(pool);
        console.log(`Connection Pool is set to \n${Env.DB_CONNECTION_STRING}`);
    }

    private routerConfig() {
        this.app.get("/logger", LoggerRouter );
        this.app.use('/env', EnvRouter);
        this.app.use('/store', StoreRouter);
       // this.app.use('/', RootRouter);

    }

   
}

//export const Server : ServerClass = new ServerClass(undefined);