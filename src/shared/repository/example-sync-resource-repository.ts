import type { ExampleSyncResource } from '@/modules/example-sync/types/example-sync-resource';
import { env } from '@/shared/config/env';
import type { ExampleSyncDatasource } from '@/shared/datasources';
import { DefaultExternalCrudRepository } from './default-external-crud-repository';

type ListResponse = Record<string, unknown> | Array<Record<string, unknown>>;

export class ExampleSyncResourceRepository extends DefaultExternalCrudRepository<
  Record<string, unknown>
> {
  protected dataSource: ExampleSyncDatasource;
  protected endpoint: string;

  constructor(readonly exampleSyncDatasource: ExampleSyncDatasource) {
    super();
    this.dataSource = exampleSyncDatasource;
    this.endpoint = '/';
  }

  public async list(): Promise<ExampleSyncResource[]> {
    const response = await this.dataSource.get<ListResponse>(
      this.normalizeEndpoint(env.example_external_api_endpoint)
    );

    const payload = response.throw().json();
    const items = this.extractItems(payload);

    return items.map(item => ({
      id: this.extractId(item),
      payload: item,
    }));
  }

  private normalizeEndpoint(endpoint: string): string {
    if (!endpoint.startsWith('/')) {
      return `/${endpoint}`;
    }

    return endpoint;
  }

  private extractItems(payload: ListResponse): Array<Record<string, unknown>> {
    if (Array.isArray(payload)) {
      return payload;
    }

    const rawItems = payload.items ?? payload.data ?? [];

    return Array.isArray(rawItems)
      ? (rawItems as Array<Record<string, unknown>>)
      : [];
  }

  private extractId(item: Record<string, unknown>): string {
    const id = item.id ?? item._id ?? item.externalId;

    if (typeof id === 'string' || typeof id === 'number') {
      return String(id);
    }

    return JSON.stringify(item);
  }
}
