export interface ResponseInterface<T = unknown> {
  body(): string;
  json(): T;
  status(): number;
  ok(): boolean;
  successful(): boolean;
  failed(): boolean;
  serverError(): boolean;
  clientError(): boolean;
  throw(): this;
  header(header: string): string | undefined;
  headers(): object;
}
