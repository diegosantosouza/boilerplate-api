import type { ExampleBackgroundJobService } from '@/modules/example-jobs/services/example-background-job-service';
import { UpsertExampleBackgroundJobSchedulerUseCase } from '@/modules/example-jobs/usecases/upsert-example-background-job-scheduler-usecase';

describe('UpsertExampleBackgroundJobSchedulerUseCase', () => {
  it('should upsert a scheduler through the service', async () => {
    const service = {
      upsertScheduler: jest.fn().mockResolvedValue({
        schedulerId: 'example-background-jobs-default',
        queueName: 'example-background-jobs',
        everyMs: 60000,
        firstJobId: 'job-1',
      }),
    } as any as jest.Mocked<ExampleBackgroundJobService>;

    const useCase = new UpsertExampleBackgroundJobSchedulerUseCase(service);
    const result = await useCase.execute({
      everyMs: 60000,
    });

    expect(service.upsertScheduler).toHaveBeenCalledWith({
      everyMs: 60000,
    });
    expect(result.schedulerId).toBe('example-background-jobs-default');
  });
});
