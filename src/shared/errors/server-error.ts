export class ServerError extends Error {
  status: number
  constructor(stack: string) {
    super('Internal server error');
    this.name = 'ServerError';
    this.stack = stack;
    this.status = 500;
  }
}
