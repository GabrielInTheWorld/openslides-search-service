import { Inject } from 'final-di';
import { Body, OnGet, RestController, Cookie, Header, RestMiddleware, RoutingError, OnPost } from 'rest-app';
import { Logger } from '../infrastructure/utils/logger';
import { SearchClient } from '../gateways/ports/search-client';
import { SearchService } from '../gateways/ports/search.service';
import { RestServerResponse } from '../infrastructure/utils/definitions';
import { createResponse } from '../infrastructure/utils/functions';
import { AutoupdateAdapter } from '../gateways/ports/autoupdate.adapter';
import { AutoupdatePort } from '../gateways/ports/autoupdate.port';
import { Collection } from '../domain/definitions/key-types';
import { SEARCH_SERVICE_HOST, SEARCH_SERVICE_PORT } from '../infrastructure/utils/config';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

interface SearchServiceRequest {
    query: string;
    collections?: Collection[];
}

interface SearchServiceResponse {
    modelData: { [index: string]: any };
    highlight: string[];
}
class CheckHeaderMiddleware implements RestMiddleware {
    public use(req: Request, _res: Response, next: NextFunction): void {
        console.log(`Headers:`, req.headers);
        if (req.header('content-type') !== `application/json`) {
            // res.status(400).json(
            //     createResponse({ message: `Content-Type is not equal to "application/json"`, success: false })
            // );
            // return;
            throw new Error(`Wrong content-type`);
            // throw new RoutingError(`Content-Type is not equal to "application/json"`, { statusCode: 400 });
        }
        next();
    }
}
// const checkHeaders = (req: Request, res: Response): void => {
//     Logger.debug('Headers:', req.headers);
//     if (req.header('content-type') !== `application/json`) {
//         // res.status(400).json(
//         //     createResponse({ message: `Content-Type is not equal to "application/json"`, success: false })
//         // );
//         // return;
//         throw new Error(`Wrong content-type`);
//         // throw new RoutingError(`Content-Type is not equal to "application/json"`, { statusCode: 400 });
//     }
// };

@RestController({ prefix: `system/search` })
export class SearchController {
    @Inject(SearchService)
    private readonly _searchService!: SearchClient;

    @Inject(AutoupdateAdapter)
    private readonly _autoupdate!: AutoupdatePort;

    @OnPost()
    public async index(
        @Body() data: SearchServiceRequest,
        @Header('authentication') accessToken: string,
        @Cookie('refreshId') refreshCookie: string
    ): Promise<RestServerResponse> {
        if (!isSearchServiceRequest(data)) {
            throw new RoutingError(`Data must contain "query" and can have "collections".`, { statusCode: 400 });
        }
        const result = await this._searchService.search(data.query);
        return createResponse({ message: 'Search could not found anything', results: [result] });
    }

    @OnGet()
    public health(): RestServerResponse {
        return createResponse({
            message: `search-service is available under ${SEARCH_SERVICE_HOST}:${SEARCH_SERVICE_PORT}`
        });
    }
}

function isSearchServiceRequest(request: any): request is SearchServiceRequest {
    return typeof request?.query === `string` && request.query.length >= 1;
}
