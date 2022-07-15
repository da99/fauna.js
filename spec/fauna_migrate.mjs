

import test from 'node:test';
import crypto from 'node:crypto';

import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema, fauna_migrate} from "../src/main.mjs";

const {If, Exists, Update, Create, Collection, CreateCollection} = q;


// # =============================================================================
// # === Helpers: ================================================================
function random_name(s = "random") {
  return `${s}_${Date.now()}`;
} // function

function map_refs(arr) {
  return arr.map(x => x.ref);
} // function
// # =============================================================================

test("client Create Collection: creates a collection", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: Collection(random_name()),
    history: 0
  };
  let cname = doc.ref.raw.collection;

  let create = await client.query(fauna_migrate(doc));
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

  let create = await client.query(fauna_migrate(doc));
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

  let create = await client.query(fauna_migrate(doc));
  let result = await client.query(fauna_migrate(doc));

  assert.equal(JSON.stringify(create.map(x => x.toString())), JSON.stringify([doc.ref.toFQL()]));
  assert.equal(JSON.stringify(result), JSON.stringify([0]));
});

test("migrate: updates document :name", async (t) => {
  await client.query(drop_schema());
  let oname = random_name("old_name");
  let nname = random_name("new_name");
  let doc = {
    ref: Collection(oname),
    name: nname,
    history: 0
  };

  await client.query(fauna_migrate(doc));
  let design = await client.query(schema());
  assert.equal([nname].toString(), design.map(x => x.name).toString());
});

test('migrate: repeated migrates do not alter the database', async () => {
  await client.query(drop_schema());
  const name = random_name("new_name");
  const docs = [
    { ref: Collection(name+'0'), history: 0 },
    { ref: Collection(name+'1'), history: 0 },
  ];

  await client.query(fauna_migrate(docs));
  await client.query(fauna_migrate(docs));
  await client.query(fauna_migrate(docs));

  let design = await client.query(schema());
  assert.equal(
    map_refs(docs).map(x => x.toFQL()).join(', '),
    map_refs(design).map(x => x.toString()).join(', ')
  );
});
