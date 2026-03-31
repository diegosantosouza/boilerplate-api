import type { Model } from 'mongoose';

export class BaseRepository<T, C> {
  protected readonly model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: C): Promise<T> {
    return this.model.create(data).then(doc => doc.toJSON() as T);
  }

  async findOne(filter: any): Promise<T | null> {
    return this.model.findOne(filter).then(doc => (doc?.toJSON() as T) ?? null);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).then(doc => (doc?.toJSON() as T) ?? null);
  }

  async find(filter: any): Promise<T[]> {
    return this.model
      .find(filter)
      .then(docs => docs.map(doc => doc.toJSON() as T));
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .then(doc => (doc?.toJSON() as T) ?? null);
  }

  async updateMany(filter: any, data: Partial<T>): Promise<number> {
    return this.model.updateMany(filter, data).then(doc => doc.modifiedCount);
  }

  async delete(id: string): Promise<boolean> {
    return this.model.findByIdAndDelete(id).then(doc => doc !== null);
  }

  async upsert(filter: any, data: Partial<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, { $set: data }, { new: true, upsert: true })
      .then(doc => (doc?.toJSON() as T) ?? null);
  }
}
