export enum HttpProtocol {
    HTTPS = 'https',
    HTTP = 'http'
}

export enum HttpMethod {
    GET = 'get',
    POST = 'post'
}

export interface HttpHeaders {
    [key: string]: string;
}

export interface HttpData {
    [key: string]: unknown;
}

export type HttpResponse<T = unknown> = {
    status: number;
    message?: string;
    data?: T;
    success?: boolean;
};
