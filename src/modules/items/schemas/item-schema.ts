import { type Document, model, Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import type { PaginateModelInterface } from '@/shared/protocols/paginate-model.interface';
import type { Item } from '../entities/item';

function toJSON(this: any): object {
  const obj = this.toObject({ getters: true, virtuals: true });
  delete obj.__v;
  obj._id = obj._id?.toString() || obj.id;
  return obj;
}

export interface ItemInterface extends Document, Item {
  id: string;
}

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

itemSchema.methods.toJSON = toJSON;

itemSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});

type PaginateModel = PaginateModelInterface<ItemInterface>;
itemSchema.plugin(paginate);

export const ItemSchema = model<ItemInterface>(
  'Item',
  itemSchema
) as PaginateModel;
