
import test from 'node:test';
import crypto from 'node:crypto';

import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema, migrate} from "../src/main.mjs";
const {If, Exists, Update, Create, Collection, CreateCollection} = q;
function random_name(s = "random") {
  return `${s}_${Date.now()}`;
} // function

test('client: it runs', async (t) => {
  let get_design = await client.query(schema());
  assert.equal("Array", get_design.constructor.name);
});

test("drop_schema: it drops the 'schema'", async (t) => {
  await client.query(drop_schema());

  let design = await client.query(schema());
  assert.equal(0, design.length);
});

test("client Create Collection: creates a collection", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: Collection(random_name()),
    history: 0
  };
  let cname = doc.ref.raw.collection;

  let create = await client.query(migrate(doc));
  let design = await client.query(schema());
  assert.equal([cname].toString(), design.map(x => x.name).toString());
});

test("migrate: adds a migrate_id", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: Collection(random_name()),
    history: 0
  };
  let cname = doc.ref.raw.collection;

  let create = await client.query(migrate(doc));
  let design = await client.query(schema());

  let migrate_id = crypto.createHash('sha512').update(JSON.stringify(doc)).digest('hex');
  assert.equal([migrate_id].toString(), design.map(x => x.data.migrate_id).toString());
});

test("migrate: does not migrate an existing document", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: Collection(random_name()),
    history: 0
  };
  let cname = doc.ref.raw.collection;
  let migrate_id = crypto.createHash('sha512').update(JSON.stringify(doc)).digest('hex');

  let create = await client.query(migrate(doc));
  let result = await client.query(migrate(doc));

  assert.equal(`No update necessary for ${JSON.stringify(doc.ref)}`, result);
});
