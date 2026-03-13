export class UnauthorizedError extends Error {
  status: number
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
    this.status = 401
  }
}
