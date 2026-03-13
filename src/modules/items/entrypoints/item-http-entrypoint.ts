import { Router } from 'express';
import { adaptRoute } from '@/shared/adapters';
import {
  makeItemCreateController,
  makeItemDeleteController,
  makeItemShowController,
  makeItemListController,
  makeItemUpdateController
} from '../factories';

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64e88c28184da39eefcf1d5b"
 *         name:
 *           type: string
 *           example: "Example Item"
 *         description:
 *           type: string
 *           example: "A sample item description"
 *         price:
 *           type: number
 *           example: 99.90
 *         active:
 *           type: boolean
 *           example: true
 *         category:
 *           type: string
 *           example: "electronics"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ItemInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           example: "New Item"
 *         description:
 *           type: string
 *           example: "Item description"
 *         price:
 *           type: number
 *           example: 49.90
 *         active:
 *           type: boolean
 *           default: true
 *         category:
 *           type: string
 *           example: "electronics"
 *     ItemUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Updated Item"
 *         description:
 *           type: string
 *           example: "Updated description"
 *         price:
 *           type: number
 *           example: 59.90
 *         active:
 *           type: boolean
 *         category:
 *           type: string
 *           example: "electronics"
 */

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management endpoints
 */

/**
 * @swagger
 * /items:
 *   get:
 *     summary: List items
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 totalItems:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *   patch:
 *     summary: Update an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemUpdateInput'
 *     responses:
 *       200:
 *         description: Item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
export const itemRouter = Router();

itemRouter.get('/', adaptRoute(makeItemListController()));
itemRouter.post('/', adaptRoute(makeItemCreateController()));
itemRouter.get('/:id', adaptRoute(makeItemShowController()));
itemRouter.patch('/:id', adaptRoute(makeItemUpdateController()));
itemRouter.delete('/:id', adaptRoute(makeItemDeleteController()));
