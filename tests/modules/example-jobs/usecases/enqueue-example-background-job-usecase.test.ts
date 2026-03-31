import type { ExampleBackgroundJobService } from '@/modules/example-jobs/services/example-background-job-service';
import { EnqueueExampleBackgroundJobUseCase } from '@/modules/example-jobs/usecases/enqueue-example-background-job-usecase';

describe('EnqueueExampleBackgroundJobUseCase', () => {
  it('should enqueue an immediate background job', async () => {
    const service = {
      enqueueImmediate: jest.fn().mockResolvedValue({
        id: 'job-1',
        name: 'example.immediate',
        queueName: 'example-background-jobs',
      }),
    } as any as jest.Mocked<ExampleBackgroundJobService>;

    const useCase = new EnqueueExampleBackgroundJobUseCase(service);
    const result = await useCase.execute({
      message: 'Run immediate job',
    });

    expect(service.enqueueImmediate).toHaveBeenCalledWith({
      message: 'Run immediate job',
    });
    expect(result.id).toBe('job-1');
  });
});
