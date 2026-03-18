import { env } from '@/shared/config/env';
import { DataSource } from './datasource';

export class ExampleSyncDatasource extends DataSource {
  protected readonly baseUrl: string;

  constructor() {
    super();
    this.baseUrl = env.example_external_api_url ?? '';
    this.bearerToken = env.example_external_api_token;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    };
  }
}
