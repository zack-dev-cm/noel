import type { StorageRepositories } from '@noetic/shared';
import { InMemoryStore } from './store.js';
import { InMemoryAdminRepository } from './adminRepository.js';
import { InMemoryPaymentRepository } from './paymentRepository.js';
import { InMemorySessionRepository } from './sessionRepository.js';
import { InMemoryTelemetryRepository } from './telemetryRepository.js';
import { InMemoryTranscriptRepository } from './transcriptRepository.js';
import { InMemoryUserRepository } from './userRepository.js';

export function createInMemoryRepositories(store = new InMemoryStore()): StorageRepositories {
  return {
    users: new InMemoryUserRepository(store),
    sessions: new InMemorySessionRepository(store),
    transcripts: new InMemoryTranscriptRepository(store),
    telemetry: new InMemoryTelemetryRepository(store),
    payments: new InMemoryPaymentRepository(store),
    admin: new InMemoryAdminRepository(store)
  };
}
