import { AxiosResponse } from 'axios';
import { RequestException } from '@/shared/http';
import { Response } from '@/shared/http/response';

const makeAxiosResponse = (
  status: number,
  data: unknown
): AxiosResponse =>
  ({
    status,
    data,
    statusText: '',
    headers: {
      'x-request-id': 'req-1',
    },
    config: {
      headers: undefined,
    } as any,
  }) as AxiosResponse;

describe('Response', () => {
  it('should expose the response payload and metadata', () => {
    const response = new Response<{ id: string }>(
      makeAxiosResponse(200, { id: '1' })
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
    const response = new Response(makeAxiosResponse(422, { error: 'invalid' }));

    expect(() => response.throw()).toThrow(RequestException);
  });
});
