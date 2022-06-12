import { Ids, Collection } from '../../domain/definitions/key-types';

export interface AutoupdateRequestConfig<T extends object = any> {
    ids: Ids;
    collection: Collection;
    fields: (keyof T)[];
}

// interface AutoupdateRequest<T extends object = any> {
//     ids: Ids;
//     collection: Collection;
//     fields: (keyof T)[];
// }

export interface AutoupdatePort {
    request(...data: AutoupdateRequestConfig[]): Promise<{ [index: string]: any }>;
}
