/**
 * Test data factory.
 *
 * Generates realistic, unique data so tests never share or collide on data
 * and can run in parallel. Set DATA_SEED in .env to reproduce the exact data
 * of a failed run (the seed of each run is written to the execution log).
 *
 * Add a builder per domain object. Keep builders pure: they return data,
 * they never call the UI or the API.
 */
import { faker } from '@faker-js/faker';
import { env } from '../config/env';

export const dataSeed = env.DATA_SEED ? Number(env.DATA_SEED) : Math.floor(Math.random() * 1_000_000);
faker.seed(dataSeed);

/** A short unique suffix: worker index + time + random, safe for parallel runs. */
export function uniqueId(prefix = 't'): string {
  const worker = process.env.TEST_WORKER_INDEX ?? '0';
  return `${prefix}${worker}${Date.now().toString(36)}${faker.string.alphanumeric(4).toLowerCase()}`;
}

export interface Person {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
}

export function buildPerson(overrides: Partial<Person> = {}): Person {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    firstName,
    lastName,
    email: `${uniqueId('qa')}@example.com`,
    // Meets common password rules: upper, lower, digit, symbol, 12+ chars.
    password: `Qa!${faker.string.alphanumeric(8)}9z`,
    phone: faker.string.numeric(10),
    dateOfBirth: faker.date.birthdate({ min: 20, max: 70, mode: 'age' }).toISOString().slice(0, 10),
    ...overrides,
  };
}

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function buildAddress(overrides: Partial<Address> = {}): Address {
  return {
    street: faker.location.street(),
    houseNumber: faker.location.buildingNumber(),
    city: faker.location.city(),
    state: faker.location.state(),
    postalCode: faker.location.zipCode('#####'),
    country: 'United States of America (the)',
    ...overrides,
  };
}

export interface ContactMessage {
  subject: string;
  message: string;
}

export function buildContactMessage(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    subject: 'Customer service',
    message: faker.lorem.sentences(3).padEnd(60, '.'),
    ...overrides,
  };
}
