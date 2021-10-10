/// <reference types="@cloudflare/workers-types" />
import KvAdapter from './adapter';

class CloudflareAdapter implements KvAdapter {
  // eslint-disable-next-line no-undef
  private namespace: KVNamespace;

  constructor(namespace: any) {
    this.namespace = namespace;
  }

  async set(key: string, value: string) {
    await this.namespace.put(key, value);
  }

  async get(key: string) {
    return this.namespace.get(key);
  }

  async delete(key: string) {
    await this.namespace.delete(key);
  }

  async list(prefix?: string) {
    return (await this.namespace.list({
      prefix,
    })).keys.map((key) => key.name);
  }
}

export default CloudflareAdapter;
