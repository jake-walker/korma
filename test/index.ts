import anyTest, { TestInterface } from 'ava';
import SimpleAdapter from '../src/adapters/simple';
import Model from '../src/model';

const test = anyTest as TestInterface<{
  adapter: SimpleAdapter,
  Model: any
}>;

test.beforeEach((t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.adapter = new SimpleAdapter();

  class ShoppingListItem extends Model {
    name: string;

    quantity: number;

    inBasket: boolean;

    constructor(id: string, name: string, quantity: number) {
      super(t.context.adapter);
      this.id = id;
      this.name = name;
      this.quantity = quantity;
      this.inBasket = false;
    }
  }

  // eslint-disable-next-line no-param-reassign
  t.context.Model = ShoppingListItem;
});

test('save item', async (t) => {
  const item = new t.context.Model('1', 'Apple', 6);
  await item.save();

  t.deepEqual(t.context.adapter.data, {
    'ShoppingListItem:1:name': '"Apple"',
    'ShoppingListItem:1:quantity': '6',
    'ShoppingListItem:1:inBasket': 'false',
  });
});

test('find item', async (t) => {
  const item = new t.context.Model('1', 'Apple', 6);
  await item.save();

  const item1 = await t.context.Model.findOne(t.context.adapter, '1');

  t.deepEqual(item, item1);
});

test('find all items', async (t) => {
  const item1 = new t.context.Model('1', 'Apple', 6);
  await item1.save();
  const item2 = new t.context.Model('2', 'Eggs', 4);
  await item2.save();

  const items = await t.context.Model.findAll(t.context.adapter);

  t.deepEqual(items, [
    new t.context.Model('1', 'Apple', 6),
    new t.context.Model('2', 'Eggs', 4),
  ]);
});

test('delete item', async (t) => {
  const item = new t.context.Model('1', 'Apple', 6);
  await item.save();
  await item.delete();

  t.deepEqual(t.context.adapter.data, {});
});

test('update item', async (t) => {
  const item = new t.context.Model('1', 'Apple', 6);
  await item.save();
  item.inBasket = true;
  await item.save();

  t.deepEqual(t.context.adapter.data, {
    'ShoppingListItem:1:name': '"Apple"',
    'ShoppingListItem:1:quantity': '6',
    'ShoppingListItem:1:inBasket': 'true',
  });
});

test('find and update item', async (t) => {
  const item = new t.context.Model('1', 'Apple', 6);
  await item.save();

  const item2 = await t.context.Model.findOne(t.context.adapter, '1');
  item2.inBasket = true;
  await item2.save();

  t.deepEqual(t.context.adapter.data, {
    'ShoppingListItem:1:name': '"Apple"',
    'ShoppingListItem:1:quantity': '6',
    'ShoppingListItem:1:inBasket': 'true',
  });
});
