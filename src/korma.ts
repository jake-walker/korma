/* eslint-disable no-underscore-dangle */
import { nanoid } from 'nanoid';
import KvAdapter from './adapters/adapter';

interface KvItem {
  _id?: string;
  [key: string]: any;
}

class Korma {
  private kvAdapter: KvAdapter;

  private kvIgnoredFields: string[] = ['_id'];

  constructor(adapter: KvAdapter) {
    this.kvAdapter = adapter;
  }

  async save(type: string, obj: KvItem) {
    const id = obj._id || nanoid();

    await Promise.all(Object.entries(obj).map(async ([fieldKey, value]) => {
      if (this.kvIgnoredFields.includes(fieldKey)) return;

      const key = `${type}:${id}:${fieldKey}`;
      await this.kvAdapter.set(key, JSON.stringify(value));
    }));

    return id;
  }

  async delete(type: string, id: string) {
    const keys = await this.kvAdapter.list(`${type}:${id}:`);

    await Promise.all(keys.map(async (key) => {
      await this.kvAdapter.delete(key);
    }));
  }

  async findOne(type: string, id: string) {
    const prefix = `${type}:${id}:`;
    const keys = await this.kvAdapter.list(prefix);
    if (keys.length === 0) return null;

    const data: KvItem = await keys.reduce(async (obj, key) => {
      const value = await this.kvAdapter.get(key);
      const fieldName = key.split(':').slice(-1)[0];
      if (value === null || typeof fieldName === 'undefined') return obj;
      return {
        ...(await obj),
        [fieldName]: JSON.parse(value),
      };
    }, Promise.resolve({}));

    data._id = id;

    return data;
  }

  async findAll(type: string) {
    const keys = await this.kvAdapter.list(`${type}:`);

    const data: { [key: string]: KvItem } = await keys.reduce(
      async (obj: Promise<{ [key: string]: KvItem }>, key) => {
        const value = await this.kvAdapter.get(key);
        const id = key.split(':')[1];
        const fieldName = key.split(':').slice(-1)[0];
        if (value === null || typeof fieldName === 'undefined') return obj;

        let current = (await obj)[id];
        if (typeof current === 'undefined') current = {};
        current[fieldName] = JSON.parse(value);

        return {
          ...(await obj),
          [id]: current,
        };
      }, Promise.resolve({}),
    );

    return Object.entries(data).map(([key, value]) => ({
      _id: key,
      ...value,
    }));
  }

  async exists(type: string, id: string) {
    const keys = await this.kvAdapter.list(`${type}:${id}:`);
    return keys.length > 0;
  }

  async getAttribute(type: string, id: string, attribute: string) {
    const value = await this.kvAdapter.get(`${type}:${id}:${attribute}`);

    if (value === null) {
      return null;
    }

    return JSON.parse(value);
  }
}

export default Korma;
