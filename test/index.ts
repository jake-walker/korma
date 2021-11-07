import anyTest, { TestInterface } from 'ava';
import SimpleAdapter from '../src/adapters/simple';
import Korma from '../src/korma';

const test = anyTest as TestInterface<{
  adapter: SimpleAdapter,
  Korma: Korma
}>;

test.beforeEach((t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.adapter = new SimpleAdapter();

  // eslint-disable-next-line no-param-reassign
  t.context.Korma = new Korma(t.context.adapter);
});

test('save item', async (t) => {
  const item = {
    _id: '1',
    name: 'Apple',
    quantity: 6,
    inBasket: false,
  };
  await t.context.Korma.save('ShoppingListItem', item);

  t.deepEqual(t.context.adapter.data, {
    'ShoppingListItem:1:name': '"Apple"',
    'ShoppingListItem:1:quantity': '6',
    'ShoppingListItem:1:inBasket': 'false',
  });
});

test('find item', async (t) => {
  const item = {
    _id: '1',
    name: 'Apple',
    quantity: 6,
    inBasket: false,
  };
  await t.context.Korma.save('ShoppingListItem', item);

  const item1 = await t.context.Korma.findOne('ShoppingListItem', '1');

  t.deepEqual(item, item1);
});

test('find all items', async (t) => {
  const item = {
    _id: '1',
    name: 'Apple',
    quantity: 6,
    inBasket: false,
  };
  await t.context.Korma.save('ShoppingListItem', item);
  const item1 = {
    _id: '2',
    name: 'Eggs',
    quantity: 4,
    inBasket: false,
  };
  await t.context.Korma.save('ShoppingListItem', item1);

  const items = await t.context.Korma.findAll('ShoppingListItem');

  t.deepEqual(items, [
    item,
    item1,
  ]);
});

test('delete item', async (t) => {
  const item = {
    _id: '1',
    name: 'Apple',
    quantity: 6,
    inBasket: false,
  };
  await t.context.Korma.save('ShoppingListItem', item);
  await t.context.Korma.delete('ShoppingListItem', '1');

  t.deepEqual(t.context.adapter.data, {});
});

test('update item', async (t) => {
  const item = {
    _id: '1',
    name: 'Apple',
    quantity: 6,
    inBasket: false,
  };
  await t.context.Korma.save('ShoppingListItem', item);
  item.inBasket = true;
  await t.context.Korma.save('ShoppingListItem', item);

  t.deepEqual(t.context.adapter.data, {
    'ShoppingListItem:1:name': '"Apple"',
    'ShoppingListItem:1:quantity': '6',
    'ShoppingListItem:1:inBasket': 'true',
  });
});

test('find and update item', async (t) => {
  const item = {
    _id: '1',
    name: 'Apple',
    quantity: 6,
    inBasket: false,
  };
  await t.context.Korma.save('ShoppingListItem', item);

  const item1 = await t.context.Korma.findOne('ShoppingListItem', '1');
  if (item1 === null) {
    throw new Error('Found item is null');
  }
  item1.inBasket = true;
  await t.context.Korma.save('ShoppingListItem', item1);

  t.deepEqual(t.context.adapter.data, {
    'ShoppingListItem:1:name': '"Apple"',
    'ShoppingListItem:1:quantity': '6',
    'ShoppingListItem:1:inBasket': 'true',
  });
});

test('save item with no id', async (t) => {
  const item = {
    name: 'Apple',
    quantity: 6,
    inBasket: false,
  };
  const id = await t.context.Korma.save('ShoppingListItem', item);

  t.deepEqual(t.context.adapter.data, {
    [`ShoppingListItem:${id}:name`]: '"Apple"',
    [`ShoppingListItem:${id}:quantity`]: '6',
    [`ShoppingListItem:${id}:inBasket`]: 'false',
  });
});
