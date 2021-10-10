# Korma

**Korma** is a library for simplifying working with Key-Value databases. It is a very simple ORM that converts classes into keys and values.

> This is a work-in-progress!

## Supported Backends

- **Redis** _(built-in)_
- **Cloudflare Workers KV** _(built-in)_

## Usage

```ts
import { Model } from 'korma';
import RedisAdapter from 'korma/adapters/redis';

const adapter = RedisAdapter();

class Person extends Model {
  firstName: string;
  lastName: string;

  constructor(firstName: string, lastName: string) {
    super(adapter);
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

// Create and save a person
const person1 = new Person('Han', 'Solo');
await person1.save();

// Create and save a second person
const person2 = new Person('Luke', 'Skywalker');
await person2.save();

// Get a person from their ID
const han = await Person.findOne(person1.id);
console.log(han.firstName, han.lastName);

// Get all the saved people
const people = await Person.findAll(adapter);
for (const person of people) {
  console.log(person.firstName, person.lastName);
}
```
