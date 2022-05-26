export interface SearchClient {
    search(query: string): Promise<any>;
}
