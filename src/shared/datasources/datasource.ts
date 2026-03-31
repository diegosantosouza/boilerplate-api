import { HttpMethodEnum, Request, type ResponseInterface } from '@/shared/http';

export abstract class DataSource {
  protected readonly requestService = new Request();
  protected abstract baseUrl: string;
  protected defaultHeaders: Record<string, unknown> = {};
  protected token?: string;
  protected bearerToken?: string;
  protected timeoutSeconds = 120000;
  protected retryTimes = 0;
  private runtimeHeaders: Record<string, unknown> = {};
  private params: Record<string, unknown> = {};

  public withHeaders(headers: Record<string, unknown>): this {
    this.runtimeHeaders = { ...this.runtimeHeaders, ...headers };
    return this;
  }

  public withParams(params: Record<string, unknown>): this {
    this.params = params;
    return this;
  }

  public withToken(token: string): this {
    this.token = token;
    return this;
  }

  public withBearerToken(token: string): this {
    this.bearerToken = `Bearer ${token}`;
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

  public async get<T = unknown>(
    endpoint: string
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.GET, endpoint);
  }

  public async post<T = unknown>(
    endpoint: string,
    data: unknown
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.POST, endpoint, data);
  }

  public async put<T = unknown>(
    endpoint: string,
    data: unknown
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.PUT, endpoint, data);
  }

  public async patch<T = unknown>(
    endpoint: string,
    data: unknown
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.PATCH, endpoint, data);
  }

  public async delete<T = unknown>(
    endpoint: string
  ): Promise<ResponseInterface<T>> {
    return this.execute<T>(HttpMethodEnum.DELETE, endpoint);
  }

  protected async before(): Promise<void> {
    return Promise.resolve();
  }

  private async execute<T = unknown>(
    method: HttpMethodEnum,
    endpoint: string,
    data?: unknown
  ): Promise<ResponseInterface<T>> {
    await this.before();

    this.requestService.baseUrl = this.baseUrl;
    this.requestService.headers = this.makeHeaders();
    this.requestService.params = this.params;
    this.requestService.retry = this.retryTimes;
    this.requestService.timeout = this.timeoutSeconds;

    try {
      return await this.requestService.execute<T>(method, endpoint, data);
    } finally {
      this.runtimeHeaders = {};
      this.params = {};
    }
  }

  private makeHeaders(): Record<string, unknown> {
    const headers = {
      ...this.defaultHeaders,
      ...this.runtimeHeaders,
    };

    if (this.token) {
      headers.token = this.token;
    }

    if (this.bearerToken) {
      headers.Authorization = this.bearerToken;
    }

    return headers;
  }
}
