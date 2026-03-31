import cors from 'cors';
import express, { json } from 'express';
import pinoHttp from 'pino-http';
import { register } from 'prom-client';
import swaggerUi from 'swagger-ui-express';
import { mainRouter } from '@/router';
import { errorHandlerMiddleware } from '../adapters';
import { PinoAuditLogger } from '../audit/pino-audit-logger';
import { pinoInstance } from '../logger/log';
import { createAuditMiddleware } from '../middlewares/audit.middleware';
import { swaggerSpec } from './swagger';

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
    this.express.use(pinoHttp({ logger: pinoInstance }));
    this.express.use(createAuditMiddleware(new PinoAuditLogger()));
  }

  private routes(): void {
    this.express.get('/metrics', async (_req, res) => {
      res.setHeader('Content-Type', register.contentType);
      res.send(await register.metrics());
    });
    this.express.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    this.express.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec)
    );
    this.express.use(mainRouter);
  }

  private errorHandlers(): void {
    this.express.use(errorHandlerMiddleware);
  }
}
export default new App().express;
