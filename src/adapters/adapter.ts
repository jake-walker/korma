/* eslint-disable no-unused-vars */

interface KvAdapter {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

export default KvAdapter;
