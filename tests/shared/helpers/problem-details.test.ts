import { buildProblemDetails } from '@/shared/helpers/problem-details';

describe('buildProblemDetails', () => {
  it('should build a complete problem details object', () => {
    const result = buildProblemDetails({
      status: 400,
      detail: 'Invalid input',
      instance: '/api/v1/items',
      errors: [{ field: 'name', message: 'Required' }],
    });

    expect(result).toEqual({
      type: 'https://httpstatuses.com/400',
      title: 'Bad Request',
      status: 400,
      detail: 'Invalid input',
      instance: '/api/v1/items',
      errors: [{ field: 'name', message: 'Required' }],
    });
  });

  it('should omit instance when not provided', () => {
    const result = buildProblemDetails({
      status: 500,
      detail: 'Something went wrong',
    });

    expect(result).toEqual({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Something went wrong',
    });
    expect(result).not.toHaveProperty('instance');
    expect(result).not.toHaveProperty('errors');
  });

  it('should omit errors when not provided', () => {
    const result = buildProblemDetails({
      status: 404,
      detail: 'Item not found',
      instance: '/api/v1/items/123',
    });

    expect(result).not.toHaveProperty('errors');
  });

  it('should map known status codes to correct titles', () => {
    const cases: Array<{ status: number; title: string }> = [
      { status: 400, title: 'Bad Request' },
      { status: 401, title: 'Unauthorized' },
      { status: 403, title: 'Forbidden' },
      { status: 404, title: 'Not Found' },
      { status: 409, title: 'Conflict' },
      { status: 422, title: 'Unprocessable Entity' },
      { status: 429, title: 'Too Many Requests' },
      { status: 500, title: 'Internal Server Error' },
    ];

    for (const { status, title } of cases) {
      const result = buildProblemDetails({ status, detail: 'test' });
      expect(result.title).toBe(title);
    }
  });

  it('should fallback to "Error" for unmapped status codes', () => {
    const result = buildProblemDetails({
      status: 418,
      detail: "I'm a teapot",
    });

    expect(result.title).toBe('Error');
    expect(result.type).toBe('https://httpstatuses.com/418');
  });
});
