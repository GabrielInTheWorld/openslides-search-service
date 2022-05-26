import axios, { AxiosError, AxiosResponse } from 'axios';
import { Logger } from '../../infrastructure/utils/logger';
import { HttpResponse, HttpMethod, HttpHeaders, HttpData } from './definitions';
import { HttpClient, HttpRequestConfig } from './http-client';

export class HttpService implements HttpClient {
    public post<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
        return this.send<T>({ method: HttpMethod.POST, ...config });
    }

    public async send<T>(config: { method: HttpMethod } & HttpRequestConfig): Promise<HttpResponse<T>> {
        const { url, data, headers, method } = config;
        Logger.debug(`Sending a request: ${method} ${url} ${JSON.stringify(data)} ${JSON.stringify(headers)}`);
        try {
            const response = await axios({ url, method, data, headers, responseType: 'json' });
            return this.createHttpResponse<T>(response);
        } catch (e) {
            const message = (e as AxiosError).message;
            this.handleError(message, url, method, data, headers);
            return this.createHttpResponse<T>((e as AxiosError).response as AxiosResponse);
        }
    }

    private handleError(error: string, url: string, method: HttpMethod, data?: HttpData, headers?: HttpHeaders): void {
        Logger.error('HTTP-error occurred: ', error);
        Logger.error(`Error is occurred while sending the following information: ${method} ${url}`);
        Logger.error(
            `Request contains the following data ${JSON.stringify(data)} and headers ${JSON.stringify(headers)}`
        );
    }

    private createHttpResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
        const result = {
            status: response.status,
            headers: response.headers as HttpHeaders
        };
        return {
            ...result,
            ...response.data
        };
    }
}
