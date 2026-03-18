import * as querystring from 'querystring';
import { HttpMethodEnum } from './http-method-enum';
import { Request } from './request';
import { ResponseInterface } from './response-interface';

type ParamType = Record<string, string | number | boolean>;

export class Http {
  private headers: Record<string, unknown> = {};
  private token?: string;
  private bearerToken?: string;
  private basicAuth?: string;
  private timeoutSeconds?: number;
  private retryTimes?: number;
  private params: ParamType[] = [];
  private _url?: string;

  public get url(): string | undefined {
    return this._url;
  }

  public set url(value: string) {
    this._url = value;
  }

  public withToken(token: string): this {
    this.token = token;
    return this;
  }

  public withHeaders(headers: Record<string, unknown>): this {
    this.headers = headers;
    return this;
  }

  public withBearerToken(token: string): this {
    this.bearerToken = `Bearer ${token}`;
    return this;
  }

  public withBasicAuth(token: string): this {
    this.basicAuth = `Basic ${token}`;
    return this;
  }

  public param(params: ParamType): this {
    this.params.push(params);
    return this;
  }

  public timeout(seconds: number): this {
    this.timeoutSeconds = seconds;
    return this;
  }

  public retry(times: number): this {
    this.retryTimes = times;
    return this;
  }

  public async get<T = unknown>(path: string): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.GET, path);
  }

  public async post<T = unknown>(
    path: string,
    data: unknown
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.POST, path, data);
  }

  public async put<T = unknown>(
    path: string,
    data: unknown
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.PUT, path, data);
  }

  public async patch<T = unknown>(
    path: string,
    data: unknown
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.PATCH, path, data);
  }

  public async delete<T = unknown>(path: string): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.DELETE, path);
  }

  private async execute<T>(
    method: HttpMethodEnum,
    path: string,
    data?: unknown
  ): Promise<ResponseInterface<T>> {
    const request = new Request();
    request.headers = this.makeHeaders();
    request.retry = this.retryTimes ?? 0;
    request.timeout = this.timeoutSeconds ?? 30000;

    return request.execute<T>(method, this.makeUrl(path), data);
  }

  private buildParams(): string {
    const params = this.params.map(param => querystring.stringify(param));
    return params.join('&');
  }

  private makeHeaders(): Record<string, unknown> {
    const headers = { ...this.headers };

    if (this.token) {
      headers.token = this.token;
    }

    if (this.bearerToken) {
      headers.Authorization = this.bearerToken;
    }

    if (this.basicAuth) {
      headers.Authorization = this.basicAuth;
    }

    return headers;
  }

  private makeUrl(path: string): string {
    const basePath = `${this._url ?? ''}${path}`;

    if (!this.params.length) {
      return basePath;
    }

    return `${basePath}?${this.buildParams()}`;
  }
}
