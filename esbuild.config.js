const esbuild = require('esbuild');
const glob = require('glob');

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig = {
  bundle: true,
  platform: 'node',
  target: 'node22',
  external: [],
  minify: isProduction,
  sourcemap: !isProduction,
  packages: 'external',
  logLevel: 'info',
};

async function buildMain() {
  try {
    console.log('Building main entry point (src/index.ts)...');

    await esbuild.build({
      ...baseConfig,
      entryPoints: ['src/index.ts'],
      outfile: 'dist/index.js',
    });

    console.log('Main build completed!');
  } catch (error) {
    console.error('Main build failed:', error);
    throw error;
  }
}

async function buildConsumers() {
  try {
    const entryPoints = glob.sync('src/consumers/**/*.ts');

    if (entryPoints.length === 0) {
      console.log('No .ts files found in src/consumers/**/*.ts');
      return;
    }

    console.log(`Building ${entryPoints.length} consumer files...`);

    await esbuild.build({
      ...baseConfig,
      entryPoints: entryPoints,
      outdir: 'dist/consumers',
    });

    console.log('Consumers build completed!');
  } catch (error) {
    console.error('Consumers build failed:', error);
    throw error;
  }
}

async function buildCrons() {
  try {
    const entryPoints = glob.sync('src/crons/**/*.ts');

    if (entryPoints.length === 0) {
      console.log('No .ts files found in src/crons/**/*.ts');
      return;
    }

    console.log(`Building ${entryPoints.length} cron files...`);

    await esbuild.build({
      ...baseConfig,
      entryPoints: entryPoints,
      outdir: 'dist/crons',
    });

    console.log('Crons build completed!');
  } catch (error) {
    console.error('Crons build failed:', error);
    throw error;
  }
}

async function buildWorkers() {
  try {
    const entryPoints = glob.sync('src/workers/**/*.ts');

    if (entryPoints.length === 0) {
      console.log('No .ts files found in src/workers/**/*.ts');
      return;
    }

    console.log(`Building ${entryPoints.length} worker files...`);

    await esbuild.build({
      ...baseConfig,
      entryPoints: entryPoints,
      outdir: 'dist/workers',
    });

    console.log('Workers build completed!');
  } catch (error) {
    console.error('Workers build failed:', error);
    throw error;
  }
}

async function buildSchedulers() {
  try {
    const entryPoints = glob.sync('src/schedulers/**/*.ts');

    if (entryPoints.length === 0) {
      console.log('No .ts files found in src/schedulers/**/*.ts');
      return;
    }

    console.log(`Building ${entryPoints.length} scheduler files...`);

    await esbuild.build({
      ...baseConfig,
      entryPoints: entryPoints,
      outdir: 'dist/schedulers',
    });

    console.log('Schedulers build completed!');
  } catch (error) {
    console.error('Schedulers build failed:', error);
    throw error;
  }
}

async function buildAll() {
  try {
    await buildMain();
    await buildConsumers();
    await buildCrons();
    await buildWorkers();
    await buildSchedulers();
    console.log('All builds completed successfully!');
  } catch (error) {
    console.error('Build process failed');
    process.exit(1);
  }
}

buildAll();
