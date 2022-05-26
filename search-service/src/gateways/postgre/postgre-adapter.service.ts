import { Inject, OnInit } from 'final-di';
import { Client, QueryResult } from 'pg';
import { HttpClient } from '../http/http-client';
import { HttpService } from '../http/http.service';
import { PostgreService } from './postgre.service';
import { Config } from '../../infrastructure/utils/config';
import { Logger } from '../../infrastructure/utils/logger';

export class PostgreAdapterService implements PostgreService, OnInit {
    @Inject(HttpService)
    public readonly http!: HttpClient;

    private readonly _database = 'openslides';
    private readonly _user = 'openslides';
    private readonly _password = 'openslides';
    private _pgClient: Client | null = null;

    public async onInit(): Promise<void> {
        await this.init();
    }

    public async getFqids(): Promise<{ fqid: string }[]> {
        const client = await this.getClient();
        const result = await client.query('select fqid from models;');
        return result.rows;
    }

    public async select(columnName: string, query: string): Promise<QueryResult> {
        const client = await this.getClient();
        return client.query(`select * from models where ${this.getColumnName(columnName)} @@ to_tsquery('${query}`);
    }

    private async init(): Promise<void> {
        this._pgClient = new Client({
            host: Config.DATABASE_HOST,
            database: this._database,
            user: this._user,
            password: this._password
        });
        await this._pgClient.connect();
        const result = await this._pgClient.query('select version()');
        Logger.log(`Connection to database successfully!\nDatabase version:`, result.rows);
        // ##############################
        // ##############################
        // ######## Query to create an index on specific fields:
        // ######## "alter table models add column <column-name> tsvector;"
        // ######## "update models set <column-name> = to_tsvector(coalesce(data ->> '<field>', '')) || to_tsvector(...) || ... where fqid ilike '...';"
        // ######## "create index <index-name> on models using gin ( <column-name> );"
        // ######## "select * from models where <column-name> @@ to_tsquery(query);" <- querying for the specific field
        // ##############################
        // ##############################
    }

    private async getClient(): Promise<Client> {
        if (!this._pgClient) {
            await this.init();
        }
        return this._pgClient as Client;
    }

    public async createColumn(name: string): Promise<void> {
        const columnName = this.getColumnName(name);
        const client = await this.getClient();
        await client
            .query(`alter table models add column ${columnName} tsvector;`)
            .then(() => console.log(`Column ${columnName} created;`))
            .catch(() => console.log(`Column ${columnName} already exists.`));
    }

    public async createIndex(name: string, indexedFields: string[]): Promise<void> {
        const client = await this.getClient();
        const columnName = this.getColumnName(name);
        const toTsVector = this.toTsVector(indexedFields);
        await client.query(`update models set ${columnName} = ${toTsVector} where fqid like '${name}/%';`);
        await client.query(`create index if not exists ${columnName}_idx on models using gin (${columnName});`);
    }

    public async createTriggerFn(name: string, indexedFields: string[]): Promise<void> {
        const client = await this.getClient();
        const columnName = this.getColumnName(name);
        const triggerName = `${columnName}_trigger_fn()`;
        const toTsVector = this.toTsVector(indexedFields, 'new.');
        const triggerFn = `
            create function ${triggerName} returns trigger as $$
            begin 
                new.${columnName} = ${toTsVector};
            return new;
            end
            $$ language plpgsql;
        `;
        await this.executePromise(`Function ${triggerName}`, client.query(triggerFn));
        await this.executePromise(
            `Trigger ${columnName}_trigger`,
            client.query(
                `create trigger ${columnName}_trigger before insert or update on models for each row execute function ${triggerName};`
            )
        );
    }

    private toTsVector(indexedFields: string[], dataPrefix: string = ''): string {
        return indexedFields.map(field => `to_tsvector(coalesce(${dataPrefix}data ->> '${field}', ''))`).join(' || ');
    }

    private getColumnName(columnName: string): string {
        return `${columnName}_view_search`;
    }

    private async executePromise(name: string, promise: Promise<any>): Promise<void> {
        try {
            await promise;
        } catch (e) {
            console.log(`${name} already exists. Skipping.`);
        }
    }
}
