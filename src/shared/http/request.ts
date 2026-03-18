import axios, { AxiosError } from 'axios';
import * as https from 'https';
import { HttpMethodEnum } from './http-method-enum';
import { Response } from './response';
import { ResponseInterface } from './response-interface';

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
        const response = await axios.request<T>({
          method,
          baseURL: this._baseUrl,
          url,
          data,
          headers: this._headers as any,
          params: this._params,
          timeout: this._timeout,
          httpsAgent: this.makeHttpsAgent(),
        });

        return new Response<T>(response);
      } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          return new Response<T>(axiosError.response);
        }

        if (attempt >= this._retry || !this.isRetryableError(axiosError)) {
          throw error;
        }

        attempt += 1;
      }
    }
  }

  private makeHttpsAgent(): https.Agent | undefined {
    const shouldValidateSSL =
      process.env.SSL_VALIDATE_CERTIFICATES === 'true' ||
      (process.env.SSL_VALIDATE_CERTIFICATES !== 'false' &&
        process.env.NODE_ENV === 'production');

    if (shouldValidateSSL) {
      return undefined;
    }

    return new https.Agent({
      rejectUnauthorized: false,
    });
  }

  private isRetryableError(error: AxiosError): boolean {
    return !error.response;
  }
}
