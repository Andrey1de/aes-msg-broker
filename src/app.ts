import * as EX  from 'express';
import { AddressInfo } from "net";
import * as path from 'path';
import { AppServer } from './servers/app.server';
import * as Env from './enviro/enviro';
//import { createIndentedFilter } from "indented-filter";
//import showdown from "showdown";

const app: EX.Express = EX();
 //Main creation process ---------------
try {
    const appServer = new AppServer(app);
} catch (e) {
    console.error(e);
    process.exit(-1);
}

console.log('aes-msg-broker Initialization processed sucessfully ....');
//import users from './routes/user';

//const debug = require('debug')('aes-msg-broker');
//debug()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(EX.static(path.join(__dirname, 'public')));

app.get('/', (req: EX.Request, res: EX.Response) => {
    res.render('index', { title: 'Express' });
});
app.get('/readme', (req: EX.Request, res: EX.Response) => {
    res.render('readme', { title: 'Express' });
});
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(( req: EX.Request, res : EX.Response, next) => {
    let err : any = {};
    err.message ='Not Found';
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err:any, req: EX.Request, res : EX.Response) => { // eslint-disable-line @typescript-eslint/no-unused-vars
         res.status(err[ 'status' ] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err:any, req: EX.Request, res : EX.Response, next:any) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//app.set('port', process.env.PORT || 3000);
//  public start = async (): Promise<number | undefined> => {
//    return new Promise((resolve, reject) => {
//        this.app.listen(this.PORT, () => {
//            resolve(this.PORT);
//        }).on('error', (err: Object) => reject(err));
//    });
//}
app.set('port', Env.PORT);
const server = app.listen(Env.PORT, function () {
    console.log(`Express server listening on port ${(server.address() as AddressInfo).port}`);
});

//export const start = server;