import { Router } from 'express';
import { z } from 'zod';
import { adaptRoute } from '@/shared/adapters';
import { registry } from '@/shared/config/openapi-registry';
import { ProblemDetailsSchema } from '@/shared/helpers/problem-details';
import {
  ItemCreateInputSchema,
  ItemIdSchema,
  ItemListResponseSchema,
  ItemOutputSchema,
  ItemUpdateInputSchema,
} from '../dto';
import {
  makeItemCreateController,
  makeItemDeleteController,
  makeItemListController,
  makeItemShowController,
  makeItemUpdateController,
} from '../factories';

const ItemListQuerySchema = z.object({
  page: z.coerce.number().int().optional().openapi({ example: 1 }),
  limit: z.coerce.number().int().optional().openapi({ example: 10 }),
  name: z.string().optional(),
  active: z.boolean().optional(),
  category: z.string().optional(),
});

registry.registerPath({
  method: 'get',
  path: '/items',
  tags: ['Items'],
  summary: 'List items',
  request: {
    query: ItemListQuerySchema,
  },
  responses: {
    200: {
      description: 'List of items',
      content: { 'application/json': { schema: ItemListResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/items',
  tags: ['Items'],
  summary: 'Create a new item',
  request: {
    body: {
      content: { 'application/json': { schema: ItemCreateInputSchema } },
    },
  },
  responses: {
    201: {
      description: 'Item created successfully',
      content: { 'application/json': { schema: ItemOutputSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/items/{id}',
  tags: ['Items'],
  summary: 'Get an item by ID',
  request: {
    params: ItemIdSchema,
  },
  responses: {
    200: {
      description: 'Item details',
      content: { 'application/json': { schema: ItemOutputSchema } },
    },
    404: {
      description: 'Item not found',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/items/{id}',
  tags: ['Items'],
  summary: 'Update an item',
  request: {
    params: ItemIdSchema,
    body: {
      content: { 'application/json': { schema: ItemUpdateInputSchema } },
    },
  },
  responses: {
    200: {
      description: 'Item updated',
      content: { 'application/json': { schema: ItemOutputSchema } },
    },
    404: {
      description: 'Item not found',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/items/{id}',
  tags: ['Items'],
  summary: 'Delete an item',
  request: {
    params: ItemIdSchema,
  },
  responses: {
    204: {
      description: 'Item deleted successfully',
    },
    404: {
      description: 'Item not found',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

export const itemRouter = Router();

itemRouter.get('/', adaptRoute(makeItemListController()));
itemRouter.post('/', adaptRoute(makeItemCreateController()));
itemRouter.get('/:id', adaptRoute(makeItemShowController()));
itemRouter.patch('/:id', adaptRoute(makeItemUpdateController()));
itemRouter.delete('/:id', adaptRoute(makeItemDeleteController()));
