import { Client, QueryResult } from 'pg';

export interface PostgreService {
    getFqids(): Promise<{ fqid: string }[]>;
    select(columnName: string, query: string): Promise<QueryResult>;
    createColumn(columnName: string): Promise<void>;
    createIndex(name: string, indexedFields: string[]): Promise<void>;
    createTriggerFn(name: string, indexedFields: string[]): Promise<void>;
    getPgClient(): Promise<Client | null>;
}
