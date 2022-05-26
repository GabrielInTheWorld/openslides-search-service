import { RestApplication } from 'rest-app';
import { Request, Response } from 'express';
import { Logger } from './infrastructure/utils/logger';
import { SearchController } from './api/search-controller';

const logRequestInformation = (req: Request): void => {
    Logger.log(`${req.protocol}://${req.headers.host || ''}: ${req.method} -- ${req.originalUrl}`);
    Logger.debug('Expected content-size:', req.headers['content-length']);
    Logger.debug('Incoming request with the following headers:\n', req.headers);
};

const corsFunction = (req: Request, res?: Response): void => {
    if (!res) {
        return;
    }
    Logger.debug('Set CORS-function');
    const origin = req.headers.origin;
    const requestingOrigin = Array.isArray(origin) ? origin.join(' ') : origin || '';
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', requestingOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE, PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, X-Content-Type,' +
            ' Authentication, Authorization, X-Access-Token, Accept'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const logErrors = (error: { toString: () => string }) => {
    if (!error) {
        return;
    }
    Logger.log(error.toString?.());
};

class Server {
    public static readonly PORT: number = parseInt(process.env.SEARCH_PORT || '', 10) || 9022;
    public static readonly DOMAIN: string = process.env.INSTANCE_DOMAIN || 'http://localhost';

    public get port(): number {
        return Server.PORT;
    }

    private _application = new RestApplication({
        controllers: [SearchController],
        port: this.port,
        requestHandlers: [logRequestInformation, corsFunction],
        logger: { logFn: (...args) => Logger.log(...args) },
        errorHandlers: [logErrors],
        name: `search-service`
    });

    public start(): void {
        this._application.start();
    }
}

const server = new Server();
server.start();