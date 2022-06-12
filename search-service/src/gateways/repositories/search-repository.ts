import { Inject } from 'final-di';
import { Repository } from './repository';
import { PostgreAdapterService, PostgreService } from '../postgre';

export abstract class SearchRepository<Model = any> implements Repository {
    public abstract readonly COLLECTION: string;

    public getCollection(): string {
        return this.COLLECTION;
    }

    public abstract getSearchableFields(): (keyof Model)[];
}
