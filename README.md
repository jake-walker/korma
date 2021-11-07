# Korma

**Korma** is a library for simplifying working with Key-Value databases. It is a very simple ORM that converts JSON objects into keys and values.

> This is a work-in-progress!

## Supported Backends

- **Redis** _(built-in)_
- **Cloudflare Workers KV** _(built-in)_

## Usage

```ts
import { Korma } from 'korma';
import RedisAdapter from 'korma/adapters/redis';

const adapter = new RedisAdapter();
const korma = new Korma(adapter);

// Create a person
const person1 = {
  firstName: 'Han',
  lastName: 'Solo'
};
// Save the person object. When saving, the first argument is the type of object.
// It kinda works like a namespace
await korma.save('Person', person1);

// Create and save a second person, this time with a ID manually given
const person2 = {
  _id: 'lskywalker',
  firstName: 'Luke',
  lastName: 'Skywalker'
};
await korma.save('Person', person2);

// Get a person from their ID
const han = await korma.findOne('Person', person1.id);
console.log(han.firstName, han.lastName);

// Get all the saved people
const people = await korma.findAll('Person');
for (const person of people) {
  console.log(person.firstName, person.lastName);
}
```
