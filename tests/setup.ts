export const testConfig = {
  mongoUri: process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/boilerplate-api-test',
  port: process.env.PORT_TEST || 3001,
};
