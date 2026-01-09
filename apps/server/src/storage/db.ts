import type { StorageRepositories } from '@noetic/shared';
import { createInMemoryRepositories } from './in_memory/index.js';
import { createPostgresRepositories } from './postgres/index.js';

export function createRepositories(): StorageRepositories {
  if (process.env.DATABASE_URL) {
    return createPostgresRepositories(process.env.DATABASE_URL);
  }
  return createInMemoryRepositories();
}
