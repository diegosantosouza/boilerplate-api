import { Agent, request } from 'undici';
import type { HttpMethodEnum } from './http-method-enum';
import { type RawResponse, Response } from './response';
import type { ResponseInterface } from './response-interface';

let insecureAgent: Agent | undefined;

function getInsecureAgent(): Agent {
  if (!insecureAgent) {
    insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });
  }
  return insecureAgent;
}

export class Request {
  private _baseUrl = '';
  private _headers: Record<string, unknown> = {};
  private _params: Record<string, unknown> = {};
  private _timeout = 120000;
  private _retry = 0;

  public set baseUrl(value: string) {
    this._baseUrl = value;
  }

  public set headers(value: Record<string, unknown>) {
    this._headers = value;
  }

  public set params(value: Record<string, unknown>) {
    this._params = value;
  }

  public set timeout(value: number) {
    this._timeout = value;
  }

  public set retry(value: number) {
    this._retry = value;
  }

  public async execute<T>(
    method: HttpMethodEnum,
    url: string,
    data?: unknown
  ): Promise<ResponseInterface<T>> {
    let attempt = 0;

    while (true) {
      try {
        const fullUrl = this.buildUrl(url);
        const headers = { ...this._headers } as Record<string, string>;

        if (data && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }

        const response = await request(fullUrl, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          headersTimeout: this._timeout,
          bodyTimeout: this._timeout,
          dispatcher: this.getDispatcher(),
        });

        const responseData = await response.body.json().catch(() => null);

        const raw: RawResponse = {
          statusCode: response.statusCode,
          data: responseData,
          headers: response.headers as Record<
            string,
            string | string[] | undefined
          >,
        };

        return new Response<T>(raw);
      } catch (error) {
        if (!this.isNetworkError(error)) {
          throw error;
        }

        if (attempt >= this._retry) {
          throw error;
        }

        attempt += 1;
      }
    }
  }

  private buildUrl(url: string): string {
    const base = this._baseUrl ? `${this._baseUrl}${url}` : url;

    const paramEntries = Object.entries(this._params).filter(
      ([, v]) => v !== undefined && v !== null
    );

    if (paramEntries.length === 0) {
      return base;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of paramEntries) {
      searchParams.append(key, String(value));
    }

    return `${base}?${searchParams.toString()}`;
  }

  private getDispatcher(): Agent | undefined {
    const shouldValidateSSL =
      process.env.SSL_VALIDATE_CERTIFICATES === 'true' ||
      (process.env.SSL_VALIDATE_CERTIFICATES !== 'false' &&
        process.env.NODE_ENV === 'production');

    if (shouldValidateSSL) {
      return undefined;
    }

    return getInsecureAgent();
  }

  private isNetworkError(error: unknown): boolean {
    return !(
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof (error as Record<string, unknown>).statusCode === 'number'
    );
  }
}
