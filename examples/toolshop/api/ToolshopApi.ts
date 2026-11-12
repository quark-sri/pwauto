/**
 * API client of the Toolshop example.
 *
 * Principle: set up data through the API (fast, reliable), check the result
 * through the UI (what the user sees). Each scenario creates its own data,
 * so scenarios can run in parallel and in any order.
 */
import { expect, type APIRequestContext } from '@playwright/test';
import { buildPerson, type Person } from '@core/utils/data-factory';

export const TOOLSHOP_API_URL = 'https://api.practicesoftwaretesting.com';

export class ToolshopApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = TOOLSHOP_API_URL,
  ) {}

  /** Register a brand-new customer and return its data (with the password). */
  async registerCustomer(overrides: Partial<Person> = {}): Promise<Person> {
    const person = buildPerson(overrides);
    const response = await this.request.post(`${this.baseUrl}/users/register`, {
      data: {
        first_name: person.firstName,
        last_name: person.lastName,
        dob: person.dateOfBirth,
        phone: person.phone,
        email: person.email,
        password: person.password,
        address: { street: 'Main Street 1', city: 'Vienna', state: 'Vienna', country: 'AT', postal_code: '1010' },
      },
    });
    expect(response.status(), `register ${person.email}: ${await response.text()}`).toBe(201);
    return person;
  }
}
