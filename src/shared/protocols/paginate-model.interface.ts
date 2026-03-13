import { Document, PaginateModel } from 'mongoose'

export interface PaginateModelInterface<T extends Document> extends PaginateModel<T> {
  [key: string]: any
}
