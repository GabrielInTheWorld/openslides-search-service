import { HttpData, HttpHeaders, HttpMethod, HttpResponse } from './definitions';

export interface HttpRequestConfig {
    url: string;
    data?: HttpData;
    headers?: HttpHeaders;
}

export interface HttpClient {
    post<T>(requestConfig: HttpRequestConfig): Promise<HttpResponse<T>>;
    send<T>(requestConfig: { method: HttpMethod } & HttpRequestConfig): Promise<HttpResponse<T>>;
}
