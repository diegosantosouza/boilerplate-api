import type { DataSource } from '@/shared/datasources';
import { HttpMethodEnum } from '@/shared/http';

type UpdateMethod = HttpMethodEnum.PUT | HttpMethodEnum.PATCH;

export abstract class DefaultExternalCrudRepository<T> {
  protected abstract dataSource: DataSource;
  protected abstract endpoint: string;

  public async find<Y = unknown>(
    query: Record<string, unknown> = {}
  ): Promise<Y> {
    const response = await this.dataSource
      .withParams(query)
      .get<Y>(this.endpoint);

    return response.throw().json();
  }

  public async findById(id: string): Promise<T> {
    const response = await this.dataSource.get<T>(`${this.endpoint}/${id}`);

    return response.throw().json();
  }

  public async create(dto: unknown): Promise<T> {
    const response = await this.dataSource.post<T>(this.endpoint, dto);

    return response.throw().json();
  }

  public async updateById(
    id: string,
    dto: unknown,
    method: UpdateMethod = HttpMethodEnum.PATCH
  ): Promise<T> {
    const response =
      method === HttpMethodEnum.PUT
        ? await this.dataSource.put<T>(`${this.endpoint}/${id}`, dto)
        : await this.dataSource.patch<T>(`${this.endpoint}/${id}`, dto);

    return response.throw().json();
  }

  public async removeById(id: string): Promise<void> {
    const response = await this.dataSource.delete(`${this.endpoint}/${id}`);

    response.throw();
  }
}
