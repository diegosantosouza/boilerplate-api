import { BaseModel } from '@/shared/models/base-model';

export type Item = BaseModel & {
  name: string;
  description: string;
  price: number;
  active: boolean;
  category: string;
};
