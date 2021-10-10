import redis from 'redis';
import { promisify } from 'util';
import KvAdapter from './adapter';

class RedisAdapter implements KvAdapter {
  private client: redis.RedisClient;

  constructor(options?: redis.ClientOpts) {
    this.client = redis.createClient(options);
  }

  async set(key: string, value: string) {
    this.client.set(key, value);
  }

  async get(key: string) {
    return (promisify(this.client.get).bind(this.client))(key);
  }

  async delete(key: string) {
    this.client.del(key);
  }

  async list(prefix?: string) {
    const asyncScan = promisify(this.client.scan).bind(this.client);
    let cursor: (string | number) = 0;
    const keys: string[] = [];

    do {
      let reply;

      if (prefix) {
        // @ts-expect-error
        // eslint-disable-next-line no-await-in-loop
        reply = await asyncScan(cursor, 'MATCH', `${prefix}*`);
      } else {
        // @ts-expect-error
        // eslint-disable-next-line no-await-in-loop
        reply = await asyncScan(cursor);
      }

      [cursor] = reply;
      keys.push(...reply[1]);
    } while (cursor !== '0');

    return keys;
  }
}

export default RedisAdapter;
