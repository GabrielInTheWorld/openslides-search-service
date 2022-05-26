import { OnGet, RestController } from 'rest-app';
import { SearchServiceResponse } from 'src/infrastructure/utils/definitions';
import { createResponse } from '../infrastructure/utils/functions';

@RestController({ prefix: `system/search` })
export class SearchController {
    @OnGet()
    public index(): SearchServiceResponse {
        return createResponse({ message: 'Search could not found anything' });
    }
}
