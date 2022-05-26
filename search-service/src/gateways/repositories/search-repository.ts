import { Repository } from './repository';

export abstract class SearchRepository<Model = any> implements Repository {
    public abstract readonly COLLECTION: string;

    public getCollection(): string {
        return this.COLLECTION;
    }

    public abstract getSearchableFields(): (keyof Model)[];
}
