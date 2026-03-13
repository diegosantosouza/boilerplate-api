import express, { json } from 'express';
import cors from 'cors';
import { mainRouter } from '@/router';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { errorHandlerMiddleware } from '../adapters';
import { morganFormat } from '../logger/morgan-log';
import morgan = require('morgan')

class App {
  public express = express();
  constructor() {
    this.config();
    this.middlewares();
    this.routes();
    this.errorHandlers();
  }

  private config(): void {
    this.express.set('query parser', 'extended');
  }

  private middlewares(): void {
    this.express.use(cors());
    this.express.use(json());
    this.express.use(morgan(morganFormat));
  }

  private routes(): void {
    this.express.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    this.express.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.express.use(mainRouter);
  }

  private errorHandlers(): void {
    this.express.use(errorHandlerMiddleware);
  }
}
export default new App().express;
