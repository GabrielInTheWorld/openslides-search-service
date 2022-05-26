import { Inject } from 'final-di';
import { OnGet, RestController } from 'rest-app';
import { SearchClient } from '../gateways/ports/search-client';
import { SearchService } from '../gateways/ports/search.service';
import { SearchServiceResponse } from '../infrastructure/utils/definitions';
import { createResponse } from '../infrastructure/utils/functions';

@RestController({ prefix: `system/search` })
export class SearchController {
    @Inject(SearchService)
    private readonly _searchService!: SearchClient;

    @OnGet()
    public index(): SearchServiceResponse {
        return createResponse({ message: 'Search could not found anything' });
    }
}
