import { AxiosResponse } from 'axios';
import { RequestException } from './request-exception';
import { ResponseInterface } from './response-interface';

export class Response<T = unknown> implements ResponseInterface<T> {
  constructor(private readonly response: AxiosResponse) {}

  public body(): string {
    return JSON.stringify(this.response.data);
  }

  public json(): T {
    return this.response.data as T;
  }

  public status(): number {
    return this.response.status;
  }

  public ok(): boolean {
    return this.response.status >= 200 && this.response.status < 300;
  }

  public successful(): boolean {
    return this.ok();
  }

  public failed(): boolean {
    return !this.ok();
  }

  public serverError(): boolean {
    return this.response.status >= 500 && this.response.status < 600;
  }

  public clientError(): boolean {
    return this.response.status >= 400 && this.response.status < 500;
  }

  public header(header: string): string | undefined {
    return this.response.headers[header] as string | undefined;
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
