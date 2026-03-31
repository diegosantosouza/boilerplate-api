import {
  MongoDBContainer,
  type StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';

let mongoContainer: StartedMongoDBContainer;
let redisContainer: StartedTestContainer;

export async function setupContainers() {
  mongoContainer = await new MongoDBContainer('mongo:7').start();
  process.env.MONGO_URI =
    mongoContainer.getConnectionString() + '/test-db?directConnection=true';

  redisContainer = await new GenericContainer('redis:alpine')
    .withExposedPorts(6379)
    .start();
  process.env.CACHE_URL = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;
}

export async function teardownContainers() {
  await mongoContainer?.stop();
  await redisContainer?.stop();
}

export { mongoContainer, redisContainer };
