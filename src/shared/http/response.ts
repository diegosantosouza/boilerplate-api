import { RequestException } from './request-exception';
import type { ResponseInterface } from './response-interface';

export interface RawResponse {
  statusCode: number;
  data: unknown;
  headers: Record<string, string | string[] | undefined>;
}

export class Response<T = unknown> implements ResponseInterface<T> {
  constructor(private readonly response: RawResponse) {}

  public body(): string {
    return JSON.stringify(this.response.data);
  }

  public json(): T {
    return this.response.data as T;
  }

  public status(): number {
    return this.response.statusCode;
  }

  public ok(): boolean {
    return this.response.statusCode >= 200 && this.response.statusCode < 300;
  }

  public successful(): boolean {
    return this.ok();
  }

  public failed(): boolean {
    return !this.ok();
  }

  public serverError(): boolean {
    return this.response.statusCode >= 500 && this.response.statusCode < 600;
  }

  public clientError(): boolean {
    return this.response.statusCode >= 400 && this.response.statusCode < 500;
  }

  public header(header: string): string | undefined {
    const value = this.response.headers[header];
    return Array.isArray(value) ? value[0] : (value as string | undefined);
  }

  public headers(): object {
    return this.response.headers;
  }

  public throw(): this {
    if (this.serverError() || this.clientError()) {
      throw new RequestException(this);
    }

    return this;
  }
}
