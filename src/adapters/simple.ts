import KvAdapter from './adapter';

class SimpleAdaper implements KvAdapter {
  data: { [key: string]: string };

  constructor() {
    this.data = {};
  }

  async set(key: string, value: string) {
    this.data[key] = value;
  }

  async get(key: string) {
    return this.data[key];
  }

  async delete(key: string) {
    delete this.data[key];
  }

  async list(prefix?: string) {
    if (typeof prefix === 'undefined') return Object.keys(this.data);
    return Object.keys(this.data).filter((key) => key.startsWith(prefix));
  }
}

export default SimpleAdaper;
