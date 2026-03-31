import { RequestException } from '@/shared/http';
import { Response, type RawResponse } from '@/shared/http/response';

const makeRawResponse = (statusCode: number, data: unknown): RawResponse => ({
  statusCode,
  data,
  headers: {
    'x-request-id': 'req-1',
  },
});

describe('Response', () => {
  it('should expose the response payload and metadata', () => {
    const response = new Response<{ id: string }>(
      makeRawResponse(200, { id: '1' })
    );

    expect(response.ok()).toBe(true);
    expect(response.successful()).toBe(true);
    expect(response.failed()).toBe(false);
    expect(response.status()).toBe(200);
    expect(response.json()).toEqual({ id: '1' });
    expect(response.body()).toBe(JSON.stringify({ id: '1' }));
    expect(response.header('x-request-id')).toBe('req-1');
  });

  it('should throw a RequestException for client and server errors', () => {
    const response = new Response(makeRawResponse(422, { error: 'invalid' }));

    expect(() => response.throw()).toThrow(RequestException);
  });
});
