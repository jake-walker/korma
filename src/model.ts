import { nanoid } from 'nanoid';
import KvAdapter from './adapters/adapter';

function serialize(x: any) {
  return JSON.stringify(x);
}

function deserialize(x: any) {
  return JSON.parse(x);
}

class Model {
  id: string;

  private kvAdapter: KvAdapter;

  private kvIgnoredFields: string[] = ['id'];

  constructor(adapter: KvAdapter) {
    this.id = nanoid();
    this.kvAdapter = adapter;
  }

  async save() {
    await Promise.all(Object.entries(this).map(async ([fieldKey, value]) => {
      if (this.kvIgnoredFields.includes(fieldKey) || fieldKey.startsWith('kv')) return;

      const key = `${this.constructor.name}:${this.id}:${fieldKey}`;
      await this.kvAdapter.set(key, serialize(value));
    }));
  }

  async delete() {
    const keys = await this.kvAdapter.list(`${this.constructor.name}:${this.id}:`);

    await Promise.all(keys.map(async (key) => {
      await this.kvAdapter.delete(key);
    }));
  }

  static async findOne(adapter: KvAdapter, id: string) {
    const prefix = `${this.name}:${id}:`;
    const keys = await adapter.list(prefix);
    if (keys.length === 0) return null;

    const data: { [key: string]: string } = await keys.reduce(async (obj, key) => {
      const value = await adapter.get(key);
      const fieldName = key.split(':').at(-1);
      if (value === null || typeof fieldName === 'undefined') return obj;
      return {
        ...(await obj),
        [fieldName]: deserialize(value),
      };
    }, Promise.resolve({}));

    data.id = id;

    return Object.assign(new this(adapter), data);
  }

  static async findAll(adapter: KvAdapter) {
    const keys = await adapter.list(`${this.name}:`);

    const data: { [key: string]: { [key: string]: string }} = await keys.reduce(
      async (obj: Promise<{ [key: string]: { [key: string]: string }}>, key) => {
        const value = await adapter.get(key);
        const id = key.split(':')[1];
        const fieldName = key.split(':').at(-1);
        if (value === null || typeof fieldName === 'undefined') return obj;

        let current = (await obj)[id];
        if (typeof current === 'undefined') current = {};
        current[fieldName] = deserialize(value);

        return {
          ...(await obj),
          [id]: current,
        };
      }, Promise.resolve({}),
    );

    const models = await Promise.all(Object.keys(data).map(async (id) => {
      const fields = data[id];
      fields.id = id;
      return Object.assign(new this(adapter), fields);
    }));

    return models;
  }
}

export default Model;
