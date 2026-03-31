import type { ResponseInterface } from './response-interface';

export class RequestException extends Error {
  public readonly response: ResponseInterface;

  constructor(response: ResponseInterface) {
    super(`HTTP request returned status code ${response.status()}.`);
    this.name = 'RequestException';
    this.response = response;
  }
}
