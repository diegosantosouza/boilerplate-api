#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const moduleName = process.argv[2];
const entityName = process.argv[3] || moduleName?.replace(/s$/, '');

if (!moduleName) {
  console.error(
    'Usage: tsx src/scripts/generate-module.ts <module-name> [entity-name]'
  );
  console.error('Example: tsx src/scripts/generate-module.ts products product');
  process.exit(1);
}

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

const toPascalCase = (s: string): string =>
  s
    .split('-')
    .map(part => capitalize(part))
    .join('');

const ctx = {
  moduleName, // "products"
  entityName, // "product"
  EntityName: toPascalCase(entityName), // "Product"
  ModuleName: toPascalCase(moduleName), // "Products"
  moduleRouter: `${entityName}Router`, // "productRouter"
};

const BASE_DIR = path.resolve('src/modules', ctx.moduleName);

if (fs.existsSync(BASE_DIR)) {
  console.error(`Error: Module directory already exists: ${BASE_DIR}`);
  process.exit(1);
}

interface GeneratedFile {
  filePath: string;
  content: string;
}

function generateFiles(): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const e = ctx.entityName;
  const E = ctx.EntityName;
  const m = ctx.moduleName;
  const M = ctx.ModuleName;

  // === entities ===
  files.push({
    filePath: `entities/${e}.ts`,
    content: `import { BaseModel } from '@/shared/models/base-model';

export type ${E} = BaseModel & {
  name: string;
  // TODO: Add entity fields
};
`,
  });

  files.push({
    filePath: 'entities/index.ts',
    content: `export * from './${e}';\n`,
  });

  // === schemas ===
  files.push({
    filePath: `schemas/${e}-schema.ts`,
    content: `import { Document, Schema, model } from 'mongoose';
import { ${E} } from '../entities/${e}';
import paginate from 'mongoose-paginate-v2';
import { PaginateModelInterface } from '@/shared/protocols/paginate-model.interface';

function toJSON(this: any): object {
  const obj = this.toObject({ getters: true, virtuals: true });
  delete obj.__v;
  obj._id = obj._id?.toString() || obj.id;
  return obj;
}

export interface ${E}Interface extends Document, ${E} {
  id: string;
}

const ${e}Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // TODO: Add schema fields
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

${e}Schema.methods.toJSON = toJSON;

${e}Schema.virtual('id').get(function (this: any) {
  return this._id.toString();
});

type PaginateModel = PaginateModelInterface<${E}Interface>;
${e}Schema.plugin(paginate);

export const ${E}Schema = model<${E}Interface>(
  '${E}',
  ${e}Schema
) as PaginateModel;
`,
  });

  files.push({
    filePath: 'schemas/index.ts',
    content: `export * from './${e}-schema';\n`,
  });

  // === repositories ===
  files.push({
    filePath: `repositories/${e}-repository-mongo.ts`,
    content: `import { BaseRepository } from '@/shared/repository/repository';
import { BaseModel } from '@/shared/models/base-model';
import { ${E}Interface, ${E}Schema } from '../schemas';
import { ${E} } from '../entities';
import { ${M}ListInput } from '../dto';
import { PaginateResult } from 'mongoose';

export class ${E}Repository extends BaseRepository<
  ${E}Interface,
  Omit<${E}, keyof BaseModel>
> {
  constructor() {
    super(${E}Schema);
  }

  async paginate(
    input: ${M}ListInput
  ): Promise<PaginateResult<${E}Interface>> {
    const criteria: { [key: string]: unknown } = {};

    if (input.name) {
      criteria.name = { $regex: input.name, $options: 'i' };
    }

    // TODO: Add filters

    const result = await ${E}Schema.paginate(criteria, {
      page: input.page,
      limit: input.limit,
      sort: '-createdAt',
    });

    return result;
  }
}
`,
  });

  files.push({
    filePath: 'repositories/index.ts',
    content: `export * from './${e}-repository-mongo';\n`,
  });

  // === constants ===
  files.push({
    filePath: 'constants/cache.ts',
    content: `import { ${M}ListInput } from '../dto';
import { buildCacheKey } from '@/shared/cache';

export const ${m.toUpperCase()}_CACHE_NAMESPACE = '${m}';

export const build${E}ShowCacheKey = (id: string): string => \`show:\${id}\`;

export const build${E}ListCacheKey = (input: ${M}ListInput): string =>
  \`list:\${buildCacheKey(input)}\`;
`,
  });

  files.push({
    filePath: 'constants/index.ts',
    content: `export * from './cache';\n`,
  });

  // === events ===
  files.push({
    filePath: `events/${e}-events.ts`,
    content: `import { ${E} } from '../entities';

export const ${E}Events = {
  CREATED: '${e}.created',
  UPDATED: '${e}.updated',
  DELETED: '${e}.deleted',
} as const;

export type ${E}CreatedPayload = ${E};
export type ${E}UpdatedPayload = ${E};
export type ${E}DeletedPayload = { id: string };
`,
  });

  files.push({
    filePath: `events/${e}-event-handlers.ts`,
    content: `import { eventBus } from '@/shared/events';
import Log from '@/shared/logger/log';
import {
  ${E}Events,
  ${E}CreatedPayload,
  ${E}UpdatedPayload,
  ${E}DeletedPayload,
} from './${e}-events';

export function register${E}EventHandlers() {
  eventBus.subscribe<${E}CreatedPayload>(${E}Events.CREATED, (event) => {
    Log.info(\`[${E}Events] ${E} created\`, { id: event.payload.id });
  });

  eventBus.subscribe<${E}UpdatedPayload>(${E}Events.UPDATED, (event) => {
    Log.info(\`[${E}Events] ${E} updated\`, { id: event.payload.id });
  });

  eventBus.subscribe<${E}DeletedPayload>(${E}Events.DELETED, (event) => {
    Log.info(\`[${E}Events] ${E} deleted\`, { id: event.payload.id });
  });
}
`,
  });

  files.push({
    filePath: 'events/index.ts',
    content: `export * from './${e}-events';
export * from './${e}-event-handlers';
`,
  });

  // === dto ===
  files.push({
    filePath: `dto/${e}-id-dto.ts`,
    content: `import { z } from 'zod';
import '@/shared/config/zod-openapi-setup';

export const ${E}IdSchema = z
  .object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  })
  .openapi('${E}Id');

export type ${E}IdInput = z.infer<typeof ${E}IdSchema>;
`,
  });

  files.push({
    filePath: `dto/${e}-create-dto.ts`,
    content: `import { z } from 'zod';
import { ${E} } from '../entities';
import '@/shared/config/zod-openapi-setup';

export const ${E}CreateInputSchema = z
  .object({
    name: z.string().min(1),
    // TODO: Add create input fields
  })
  .openapi('${E}CreateInput');

export type ${E}CreateInput = z.infer<typeof ${E}CreateInputSchema>;
export type ${E}CreateOutput = ${E};
`,
  });

  files.push({
    filePath: `dto/${e}-update-dto.ts`,
    content: `import { z } from 'zod';
import { ${E} } from '../entities';
import { ${E}CreateInputSchema } from './${e}-create-dto';

export const ${E}UpdateInputSchema = ${E}CreateInputSchema.partial().openapi(
  '${E}UpdateInput'
);

export type ${E}UpdateInput = z.infer<typeof ${E}UpdateInputSchema>;
export type ${E}UpdateOutput = ${E};
`,
  });

  files.push({
    filePath: `dto/${e}-show-dto.ts`,
    content: `import { ${E}IdInput } from './${e}-id-dto';
import { ${E} } from '../entities';

export type ${E}ShowOutput = ${E};
export type ${E}ShowInput = ${E}IdInput;
`,
  });

  files.push({
    filePath: `dto/${e}-delete-dto.ts`,
    content: `import { ${E}IdInput } from './${e}-id-dto';

export type ${E}DeleteOutput = boolean;
export type ${E}DeleteInput = ${E}IdInput;
`,
  });

  files.push({
    filePath: `dto/${e}-list-dto.ts`,
    content: `import { z } from 'zod';
import { ${E} } from '../entities';
import { PaginationSchema } from '@/shared/helpers';
import { PaginateResult } from 'mongoose';
import '@/shared/config/zod-openapi-setup';

export const ${M}ListInputSchema = PaginationSchema.extend({
  name: z.string().optional(),
  // TODO: Add list filters
}).openapi('${M}ListInput');

export type ${M}ListInput = z.infer<typeof ${M}ListInputSchema>;
export type ${M}ListOutput = PaginateResult<${E}>;
`,
  });

  files.push({
    filePath: `dto/${e}-output-schema.ts`,
    content: `import { z } from 'zod';
import '@/shared/config/zod-openapi-setup';

export const ${E}OutputSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    // TODO: Add output fields matching entity
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('${E}');

export const ${E}ListResponseSchema = z
  .object({
    ${m}: z.array(${E}OutputSchema),
    limit: z.number().int(),
    page: z.number().int(),
    totalItems: z.number().int(),
    totalPages: z.number().int(),
    nextPage: z.number().int().nullable(),
    prevPage: z.number().int().nullable(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  })
  .openapi('${E}ListResponse');
`,
  });

  files.push({
    filePath: 'dto/index.ts',
    content: `export * from './${e}-create-dto';
export * from './${e}-update-dto';
export * from './${e}-id-dto';
export * from './${e}-show-dto';
export * from './${e}-delete-dto';
export * from './${e}-list-dto';
export * from './${e}-output-schema';
`,
  });

  // === usecases ===
  files.push({
    filePath: `usecases/${e}-create-usecase.ts`,
    content: `import { ok } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import { eventBus } from '@/shared/events';
import type { DomainResult } from '@/shared/protocols/result';
import { ${E}Repository } from '../repositories';
import { ${E}CreateInput, ${E}CreateOutput } from '../dto';
import { ${m.toUpperCase()}_CACHE_NAMESPACE } from '../constants/cache';
import { ${E}Events } from '../events/${e}-events';

export class ${E}CreateUseCase {
  constructor(
    private readonly ${e}Repository: ${E}Repository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ${E}CreateUseCase.Input
  ): Promise<DomainResult<${E}CreateUseCase.Output>> {
    const ${e} = await this.${e}Repository.create(input);
    await this.cacheProvider.refreshNamespaceToken(${m.toUpperCase()}_CACHE_NAMESPACE);
    eventBus.publish({
      name: ${E}Events.CREATED,
      payload: ${e},
      occurredAt: new Date(),
    });
    return ok(${e});
  }
}

export namespace ${E}CreateUseCase {
  export type Input = ${E}CreateInput;
  export type Output = ${E}CreateOutput;
}
`,
  });

  files.push({
    filePath: `usecases/${e}-show-usecase.ts`,
    content: `import { ok, err } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import type { DomainResult } from '@/shared/protocols/result';
import { ${E}ShowInput, ${E}ShowOutput } from '../dto';
import { ${E}Repository } from '../repositories';
import {
  build${E}ShowCacheKey,
  ${m.toUpperCase()}_CACHE_NAMESPACE,
} from '../constants/cache';

export class ${E}ShowUseCase {
  constructor(
    private readonly ${e}Repository: ${E}Repository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ${E}ShowUseCase.Input
  ): Promise<DomainResult<${E}ShowUseCase.Output>> {
    const ${e} = await this.cacheProvider.remember(
      build${E}ShowCacheKey(input.id),
      async () => this.${e}Repository.findById(input.id),
      { namespace: ${m.toUpperCase()}_CACHE_NAMESPACE }
    );

    if (!${e}) {
      return err({
        type: 'NOT_FOUND',
        message: '${E} not found',
        resource: '${E}',
      });
    }

    return ok(${e});
  }
}

export namespace ${E}ShowUseCase {
  export type Input = ${E}ShowInput;
  export type Output = ${E}ShowOutput;
}
`,
  });

  files.push({
    filePath: `usecases/${e}-update-usecase.ts`,
    content: `import { ok, err } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import { eventBus } from '@/shared/events';
import type { DomainResult } from '@/shared/protocols/result';
import { ${E}IdInput, ${E}UpdateInput, ${E}UpdateOutput } from '../dto';
import { ${E}Repository } from '../repositories';
import { ${m.toUpperCase()}_CACHE_NAMESPACE } from '../constants/cache';
import { ${E}Events } from '../events/${e}-events';

export class ${E}UpdateUseCase {
  constructor(
    private readonly ${e}Repository: ${E}Repository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ${E}UpdateUseCase.Input
  ): Promise<DomainResult<${E}UpdateUseCase.Output>> {
    const ${e}Exists = await this.${e}Repository.findById(input.id);
    if (!${e}Exists) {
      return err({
        type: 'NOT_FOUND',
        message: '${E} not found',
        resource: '${E}',
      });
    }

    const ${e} = await this.${e}Repository.update(input.id, input);
    if (!${e}) {
      return err({
        type: 'INTERNAL',
        message: 'Failed to update ${e}',
      });
    }

    await this.cacheProvider.refreshNamespaceToken(${m.toUpperCase()}_CACHE_NAMESPACE);
    eventBus.publish({
      name: ${E}Events.UPDATED,
      payload: ${e},
      occurredAt: new Date(),
    });
    return ok(${e});
  }
}

export namespace ${E}UpdateUseCase {
  export type Input = ${E}UpdateInput & ${E}IdInput;
  export type Output = ${E}UpdateOutput;
}
`,
  });

  files.push({
    filePath: `usecases/${e}-delete-usecase.ts`,
    content: `import { ok, err } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import { eventBus } from '@/shared/events';
import type { DomainResult } from '@/shared/protocols/result';
import { ${E}DeleteInput, ${E}DeleteOutput } from '../dto';
import { ${E}Repository } from '../repositories';
import { ${m.toUpperCase()}_CACHE_NAMESPACE } from '../constants/cache';
import { ${E}Events } from '../events/${e}-events';

export class ${E}DeleteUseCase {
  constructor(
    private readonly ${e}Repository: ${E}Repository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ${E}DeleteUseCase.Input
  ): Promise<DomainResult<${E}DeleteUseCase.Output>> {
    const ${e}Exists = await this.${e}Repository.findById(input.id);
    if (!${e}Exists) {
      return err({
        type: 'NOT_FOUND',
        message: '${E} not found',
        resource: '${E}',
      });
    }

    const deleted = await this.${e}Repository.delete(input.id);
    if (!deleted) {
      return err({
        type: 'INTERNAL',
        message: 'Failed to delete ${E}',
      });
    }

    await this.cacheProvider.refreshNamespaceToken(${m.toUpperCase()}_CACHE_NAMESPACE);
    eventBus.publish({
      name: ${E}Events.DELETED,
      payload: { id: input.id },
      occurredAt: new Date(),
    });
    return ok(true);
  }
}

export namespace ${E}DeleteUseCase {
  export type Input = ${E}DeleteInput;
  export type Output = ${E}DeleteOutput;
}
`,
  });

  files.push({
    filePath: `usecases/${e}-list-usecase.ts`,
    content: `import { ok } from 'neverthrow';
import type { CacheProvider } from '@/shared/cache';
import type { DomainResult } from '@/shared/protocols/result';
import { ${M}ListInput, ${M}ListOutput } from '../dto';
import { ${E}Repository } from '../repositories';
import {
  build${E}ListCacheKey,
  ${m.toUpperCase()}_CACHE_NAMESPACE,
} from '../constants/cache';

export class ${E}ListUseCase {
  constructor(
    private readonly ${e}Repository: ${E}Repository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async execute(
    input: ${E}ListUseCase.Input
  ): Promise<DomainResult<${E}ListUseCase.Output>> {
    const result = await this.cacheProvider.remember(
      build${E}ListCacheKey(input),
      () => this.${e}Repository.paginate(input),
      { namespace: ${m.toUpperCase()}_CACHE_NAMESPACE }
    );
    return ok(result);
  }
}

export namespace ${E}ListUseCase {
  export type Input = ${M}ListInput;
  export type Output = ${M}ListOutput;
}
`,
  });

  files.push({
    filePath: 'usecases/index.ts',
    content: `export * from './${e}-create-usecase';
export * from './${e}-delete-usecase';
export * from './${e}-list-usecase';
export * from './${e}-show-usecase';
export * from './${e}-update-usecase';
`,
  });

  // === controllers ===
  files.push({
    filePath: `controllers/${e}-create-http-controller.ts`,
    content: `import type { Request } from 'express';
import type { HttpResponse } from '@/shared/protocols/http';
import { created, domainErrorToResponse } from '@/shared/helpers';
import type { ${E}CreateUseCase } from '../usecases';
import { ${E}CreateInputSchema } from '../dto';

export class ${E}CreateHttpController {
  constructor(private readonly ${e}CreateUseCase: ${E}CreateUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ${E}CreateInputSchema.parse(req.body);
    const result = await this.${e}CreateUseCase.execute(parsed);

    return result.match(
      (${e}) => created(${e}),
      (error) => domainErrorToResponse(error)
    );
  }
}
`,
  });

  files.push({
    filePath: `controllers/${e}-show-http-controller.ts`,
    content: `import type { Request } from 'express';
import type { HttpResponse } from '@/shared/protocols/http';
import { domainErrorToResponse, ok } from '@/shared/helpers';
import type { ${E}ShowUseCase } from '../usecases';
import { ${E}IdSchema } from '../dto';

export class ${E}ShowHttpController {
  constructor(private readonly ${e}ShowUseCase: ${E}ShowUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ${E}IdSchema.parse(req.params);
    const result = await this.${e}ShowUseCase.execute(parsed);

    return result.match(
      (${e}) => ok(${e}),
      (error) => domainErrorToResponse(error)
    );
  }
}
`,
  });

  files.push({
    filePath: `controllers/${e}-update-http-controller.ts`,
    content: `import type { Request } from 'express';
import type { HttpResponse } from '@/shared/protocols/http';
import { domainErrorToResponse, ok } from '@/shared/helpers';
import { ${E}IdSchema, ${E}UpdateInputSchema } from '../dto';
import type { ${E}UpdateUseCase } from '../usecases';

export class ${E}UpdateHttpController {
  constructor(private readonly ${e}UpdateUseCase: ${E}UpdateUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const idParsed = ${E}IdSchema.parse(req.params);
    const parsed = ${E}UpdateInputSchema.parse(req.body);
    const result = await this.${e}UpdateUseCase.execute({
      ...parsed,
      id: idParsed.id,
    });

    return result.match(
      (${e}) => ok(${e}),
      (error) => domainErrorToResponse(error)
    );
  }
}
`,
  });

  files.push({
    filePath: `controllers/${e}-delete-http-controller.ts`,
    content: `import type { Request } from 'express';
import type { HttpResponse } from '@/shared/protocols/http';
import { domainErrorToResponse, noContent } from '@/shared/helpers';
import { ${E}IdSchema } from '../dto';
import type { ${E}DeleteUseCase } from '../usecases';

export class ${E}DeleteHttpController {
  constructor(private readonly ${e}DeleteUseCase: ${E}DeleteUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const idParsed = ${E}IdSchema.parse(req.params);
    const result = await this.${e}DeleteUseCase.execute(idParsed);

    return result.match(
      () => noContent(),
      (error) => domainErrorToResponse(error)
    );
  }
}
`,
  });

  files.push({
    filePath: `controllers/${e}-list-http-controller.ts`,
    content: `import type { Request } from 'express';
import type { HttpResponse } from '@/shared/protocols/http';
import { domainErrorToResponse, ok } from '@/shared/helpers';
import { ${M}ListInputSchema } from '../dto';
import type { ${E}ListUseCase } from '../usecases';

export class ${E}ListHttpController {
  constructor(private readonly ${e}ListUseCase: ${E}ListUseCase) {}

  async handle(req: Request): Promise<HttpResponse> {
    const parsed = ${M}ListInputSchema.parse(req.query);
    const result = await this.${e}ListUseCase.execute(parsed);

    return result.match(
      (paginateResult) =>
        ok({
          ${m}: paginateResult.docs,
          limit: paginateResult.limit,
          page: paginateResult.page,
          totalItems: paginateResult.totalDocs,
          totalPages: paginateResult.totalPages,
          nextPage: paginateResult.hasNextPage
            ? (paginateResult.page || 1) + 1
            : null,
          prevPage: paginateResult.hasPrevPage
            ? (paginateResult.page || 1) - 1
            : null,
          hasNextPage: paginateResult.hasNextPage,
          hasPrevPage: paginateResult.hasPrevPage,
        }),
      (error) => domainErrorToResponse(error)
    );
  }
}
`,
  });

  files.push({
    filePath: 'controllers/index.ts',
    content: `export * from './${e}-create-http-controller';
export * from './${e}-show-http-controller';
export * from './${e}-update-http-controller';
export * from './${e}-delete-http-controller';
export * from './${e}-list-http-controller';
`,
  });

  // === factories ===
  files.push({
    filePath: `factories/${e}-create-controller-factory.ts`,
    content: `import { Cache } from '@/shared/cache';
import { ${E}CreateHttpController } from '../controllers';
import { ${E}Repository } from '../repositories';
import { ${E}CreateUseCase } from '../usecases';

export const make${E}CreateController = (): ${E}CreateHttpController => {
  const ${e}Repository = new ${E}Repository();
  const ${e}CreateUseCase = new ${E}CreateUseCase(
    ${e}Repository,
    Cache.getInstance()
  );
  return new ${E}CreateHttpController(${e}CreateUseCase);
};
`,
  });

  files.push({
    filePath: `factories/${e}-show-controller-factory.ts`,
    content: `import { Cache } from '@/shared/cache';
import { ${E}Repository } from '../repositories';
import { ${E}ShowUseCase } from '../usecases';
import { ${E}ShowHttpController } from '../controllers';

export const make${E}ShowController = (): ${E}ShowHttpController => {
  const ${e}Repository = new ${E}Repository();
  const ${e}ShowUseCase = new ${E}ShowUseCase(${e}Repository, Cache.getInstance());
  return new ${E}ShowHttpController(${e}ShowUseCase);
};
`,
  });

  files.push({
    filePath: `factories/${e}-update-controller-factory.ts`,
    content: `import { Cache } from '@/shared/cache';
import { ${E}UpdateHttpController } from '../controllers';
import { ${E}Repository } from '../repositories';
import { ${E}UpdateUseCase } from '../usecases';

export const make${E}UpdateController = (): ${E}UpdateHttpController => {
  const ${e}Repository = new ${E}Repository();
  const ${e}UpdateUseCase = new ${E}UpdateUseCase(
    ${e}Repository,
    Cache.getInstance()
  );
  return new ${E}UpdateHttpController(${e}UpdateUseCase);
};
`,
  });

  files.push({
    filePath: `factories/${e}-delete-controller-factory.ts`,
    content: `import { Cache } from '@/shared/cache';
import { ${E}DeleteHttpController } from '../controllers';
import { ${E}Repository } from '../repositories';
import { ${E}DeleteUseCase } from '../usecases';

export const make${E}DeleteController = (): ${E}DeleteHttpController => {
  const ${e}Repository = new ${E}Repository();
  const ${e}DeleteUseCase = new ${E}DeleteUseCase(
    ${e}Repository,
    Cache.getInstance()
  );
  return new ${E}DeleteHttpController(${e}DeleteUseCase);
};
`,
  });

  files.push({
    filePath: `factories/${e}-list-controller-factory.ts`,
    content: `import { Cache } from '@/shared/cache';
import { ${E}ListHttpController } from '../controllers';
import { ${E}ListUseCase } from '../usecases';
import { ${E}Repository } from '../repositories';

export const make${E}ListController = (): ${E}ListHttpController => {
  const ${e}Repository = new ${E}Repository();
  const ${e}ListUseCase = new ${E}ListUseCase(${e}Repository, Cache.getInstance());
  return new ${E}ListHttpController(${e}ListUseCase);
};
`,
  });

  files.push({
    filePath: 'factories/index.ts',
    content: `export * from './${e}-create-controller-factory';
export * from './${e}-show-controller-factory';
export * from './${e}-update-controller-factory';
export * from './${e}-delete-controller-factory';
export * from './${e}-list-controller-factory';
`,
  });

  // === entrypoints ===
  files.push({
    filePath: `entrypoints/${e}-http-entrypoint.ts`,
    content: `import { Router } from 'express';
import { adaptRoute } from '@/shared/adapters';
import { registry } from '@/shared/config/openapi-registry';
import { ProblemDetailsSchema } from '@/shared/helpers/problem-details';
import {
  make${E}CreateController,
  make${E}DeleteController,
  make${E}ShowController,
  make${E}ListController,
  make${E}UpdateController,
} from '../factories';
import {
  ${E}CreateInputSchema,
  ${E}UpdateInputSchema,
  ${E}OutputSchema,
  ${E}ListResponseSchema,
} from '../dto';

registry.registerPath({
  method: 'get',
  path: '/${m}',
  tags: ['${M}'],
  summary: 'List ${m}',
  request: {
    query: ${E}ListResponseSchema.shape.${m}.unwrap().element.pick({}).extend({
      page: ${E}ListResponseSchema.shape.page.optional(),
      limit: ${E}ListResponseSchema.shape.limit.optional(),
      name: ${E}OutputSchema.shape.name.optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of ${m}',
      content: { 'application/json': { schema: ${E}ListResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/${m}',
  tags: ['${M}'],
  summary: 'Create a new ${e}',
  request: {
    body: {
      content: { 'application/json': { schema: ${E}CreateInputSchema } },
    },
  },
  responses: {
    201: {
      description: '${E} created successfully',
      content: { 'application/json': { schema: ${E}OutputSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/${m}/{id}',
  tags: ['${M}'],
  summary: 'Get a ${e} by ID',
  request: {
    params: ${E}OutputSchema.pick({ id: true }),
  },
  responses: {
    200: {
      description: '${E} details',
      content: { 'application/json': { schema: ${E}OutputSchema } },
    },
    404: {
      description: '${E} not found',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/${m}/{id}',
  tags: ['${M}'],
  summary: 'Update a ${e}',
  request: {
    params: ${E}OutputSchema.pick({ id: true }),
    body: {
      content: { 'application/json': { schema: ${E}UpdateInputSchema } },
    },
  },
  responses: {
    200: {
      description: '${E} updated',
      content: { 'application/json': { schema: ${E}OutputSchema } },
    },
    404: {
      description: '${E} not found',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/${m}/{id}',
  tags: ['${M}'],
  summary: 'Delete a ${e}',
  request: {
    params: ${E}OutputSchema.pick({ id: true }),
  },
  responses: {
    204: {
      description: '${E} deleted successfully',
    },
    404: {
      description: '${E} not found',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
});

export const ${ctx.moduleRouter} = Router();

${ctx.moduleRouter}.get('/', adaptRoute(make${E}ListController()));
${ctx.moduleRouter}.post('/', adaptRoute(make${E}CreateController()));
${ctx.moduleRouter}.get('/:id', adaptRoute(make${E}ShowController()));
${ctx.moduleRouter}.patch('/:id', adaptRoute(make${E}UpdateController()));
${ctx.moduleRouter}.delete('/:id', adaptRoute(make${E}DeleteController()));
`,
  });

  files.push({
    filePath: 'entrypoints/index.ts',
    content: `export * from './${e}-http-entrypoint';\n`,
  });

  // === module barrel ===
  files.push({
    filePath: 'index.ts',
    content: `export * from './controllers';
export * from './dto';
export * from './entities';
export * from './entrypoints';
export * from './events';
export * from './factories';
export * from './repositories';
export * from './schemas';
export * from './usecases';
`,
  });

  return files;
}

// Generate all files
const files = generateFiles();
let createdCount = 0;

for (const file of files) {
  const fullPath = path.join(BASE_DIR, file.filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, file.content);
  console.log(`  Created: src/modules/${ctx.moduleName}/${file.filePath}`);
  createdCount++;
}

console.log(
  `\n  ${createdCount} files generated for module "${ctx.moduleName}".`
);
console.log(`\n  Next steps:`);
console.log(
  `  1. Fill in TODO fields in entities, schemas, DTOs, and repository`
);
console.log(`  2. Register routes in src/router/index.ts:`);
console.log(
  `     import { ${ctx.moduleRouter} } from '../modules/${ctx.moduleName}';`
);
console.log(`     mainRouter.use('/${ctx.moduleName}', ${ctx.moduleRouter});`);
console.log(`  3. Register event handlers in src/index.ts:`);
console.log(
  `     import { register${ctx.EntityName}EventHandlers } from './modules/${ctx.moduleName}/events/${ctx.entityName}-event-handlers';`
);
console.log(`     register${ctx.EntityName}EventHandlers();`);
console.log(`  4. Run: npm run dev`);
