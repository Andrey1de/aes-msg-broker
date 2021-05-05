//import cors = require('cors');

import  * as express from 'express';
import { Express } from 'express';
    
import * as path from 'path';
import { StoreRouter }  from '../routes/store.route';
import { EnvRouter } from '../routes/env.route';
import { RootRouter } from '../routes/root.route';
import { LoggerRouter } from '../routes/logger.route';

//import express = require('express');
import {Env} from '../env/env';
import {DbServer as DB} from './db.server';

import { Logger } from "../logger/logger";

// import * as S from './common/http-status';
// import { Request, Response } from 'express';


export class AppServer{
     public PORT:number = 0;

    constructor(readonly app : Express | undefined) {
        this.PORT =Env.PORT;
        this.app = this.app || express();
        this.appConfig();
        this.routerConfig();
        this.dbConnect();
    }

    private appConfig() {
      
       // this.app.use(cors());
        this.app.use(express.json({ limit: '1mb' })); // 100kb default
        this.app.use(express.text());
        this.app.use(express.urlencoded({ extended: true }));
      
;

    }

    private dbConnect() {
        DB.Pool.connect(function (err, client, done) {
            if (err) throw err;
            console.log(`Connected pool on ${DB.DB_CONNECTION_STRING}`);
          }); 
    }

    private routerConfig() {
        this.app.get("/logger", LoggerRouter );
        this.app.use('/env', EnvRouter);
        this.app.use('/store', StoreRouter);
        this.app.use('/', RootRouter);

    }

   
}

//export const Server : ServerClass = new ServerClass(undefined);