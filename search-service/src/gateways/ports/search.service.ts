import { Inject, OnInit } from 'final-di';
import { SearchClient } from './search-client';
import { PostgreAdapterService } from '../postgre/postgre-adapter.service';
import { PostgreService } from '../postgre/postgre.service';
import { Logger } from '../../infrastructure/utils/logger';
import { TopicRepository } from '../repositories/topics/topic-repository';
import { SearchRepository } from '../repositories/search-repository';
import { MotionBlockRepository } from '../repositories/motions/motion-block-repository';

export class SearchService implements SearchClient, OnInit {
    @Inject(PostgreAdapterService)
    private readonly postgre!: PostgreService;

    @Inject(TopicRepository)
    private readonly topicRepo!: SearchRepository;

    @Inject(MotionBlockRepository)
    private readonly motionblockRepo!: SearchRepository;

    private readonly _repositories = [this.topicRepo, this.motionblockRepo];

    public async onInit(): Promise<void> {
        await this.initSearchIndexes();
        Logger.log(`Search indices created!`);
        await this.logCollections();
    }

    public async search(searchQuery: string): Promise<any> {
        searchQuery = searchQuery.split(' ').join(' | ');
        const promises = this._repositories.map(repo => this.postgre.select(repo.COLLECTION, searchQuery));
        const result = (await Promise.all(promises)).flatMap(entry => entry.rows);
        Logger.debug(`Search result contains ${result.length} entries.`);
        return result;
    }

    private async initSearchIndexes(): Promise<void> {
        const collections = this._repositories.map(repo => repo.getCollection());
        await Promise.all(collections.map(collection => this.postgre.createColumn(collection)));
        await Promise.all(
            this._repositories
                .map(repo => ({ collection: repo.getCollection(), indexedFields: repo.getSearchableFields() }))
                .map(item => this.postgre.createIndex(item.collection, item.indexedFields as string[]))
        );
        await Promise.all(
            this._repositories
                .map(repo => ({ collection: repo.getCollection(), indexedFields: repo.getSearchableFields() }))
                .map(item => this.postgre.createTriggerFn(item.collection, item.indexedFields as string[]))
        );
    }

    private async logCollections(): Promise<void> {
        const fqids = await this.postgre.getFqids();
        const collections: { [collection: string]: string[] } = {};
        for (const fqid of fqids) {
            const [collection, id] = fqid.fqid.split(`/`);
            if (!collections[collection]) {
                collections[collection] = [];
            }
            collections[collection].push(id);
        }
        Logger.debug(`Found ${Object.keys(collections).length} collections!`);
        for (const collection of Object.keys(collections)) {
            Logger.debug(`Found collection ${collection.toUpperCase()}: ${collections[collection].length} entries!`);
        }
    }
}
