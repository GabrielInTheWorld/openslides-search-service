import { Collection } from '../../domain/definitions/key-types';
export interface SearchClientResponse {
    collection: Collection;
    fields: { [fieldName: string]: string };
}

export interface SearchClient {
    search(query: string): Promise<SearchClientResponse>;
}
