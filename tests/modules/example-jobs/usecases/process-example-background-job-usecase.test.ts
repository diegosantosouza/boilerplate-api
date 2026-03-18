import { ProcessExampleBackgroundJobUseCase } from '@/modules/example-jobs/usecases/process-example-background-job-usecase';

describe('ProcessExampleBackgroundJobUseCase', () => {
  it('should process a successful job and return a result payload', async () => {
    const useCase = new ProcessExampleBackgroundJobUseCase();
    const job = {
      id: 'job-1',
      name: 'example.immediate',
      attemptsMade: 0,
      data: {
        message: 'hello world',
        source: 'api',
        createdAt: new Date().toISOString(),
      },
      updateProgress: jest.fn(),
    } as any;

    const result = await useCase.execute(job);

    expect(job.updateProgress).toHaveBeenNthCalledWith(1, 10);
    expect(job.updateProgress).toHaveBeenNthCalledWith(2, 100);
    expect(result.message).toBe('hello world');
  });

  it('should throw when the retry demo has not yet reached the success attempt', async () => {
    const useCase = new ProcessExampleBackgroundJobUseCase();
    const job = {
      id: 'job-2',
      name: 'example.retry-demo',
      attemptsMade: 0,
      data: {
        message: 'retry demo',
        source: 'api',
        createdAt: new Date().toISOString(),
        failUntilAttempt: 2,
      },
      updateProgress: jest.fn(),
    } as any;

    await expect(useCase.execute(job)).rejects.toThrow(
      'Simulated processing failure'
    );
  });
});
