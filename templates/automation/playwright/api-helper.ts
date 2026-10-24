import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  async get(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(url, { headers: this.defaultHeaders(headers) });
  }

  async post(url: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(url, { data, headers: this.defaultHeaders(headers) });
  }

  async put(url: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.put(url, { data, headers: this.defaultHeaders(headers) });
  }

  async patch(url: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.patch(url, { data, headers: this.defaultHeaders(headers) });
  }

  async delete(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.delete(url, { headers: this.defaultHeaders(headers) });
  }

  private defaultHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };
  }

  async expectSuccess(response: APIResponse, expectedStatus = 200) {
    expect(response.status()).toBe(expectedStatus);
    return response.json();
  }

  async expectError(response: APIResponse, expectedStatus: number, expectedMessage?: string) {
    expect(response.status()).toBe(expectedStatus);
    if (expectedMessage) {
      const body = await response.json();
      expect(body.message).toContain(expectedMessage);
    }
  }
}
