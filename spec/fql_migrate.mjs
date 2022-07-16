

import test from 'node:test';
import crypto from 'node:crypto';

import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema, fql_migrate} from "../src/main.mjs";
import { random_name } from "./_helper.mjs";

const {If, Exists, Update, Create, Collection, CreateCollection} = q;


// # =============================================================================
// # === Helpers: ================================================================
function map_refs(arr) {
  return arr.map(x => x.ref);
} // function
// # =============================================================================

test("fql_migrate: creates a collection", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: Collection(random_name()),
    history: 0
  };
  let cname = doc.ref.raw.collection;

  await fql_migrate(doc);
  let design = await client.query(schema());
  assert.equal([cname].toString(), design.map(x => x.name).toString());
});

test("fql_migrate: adds a migrate_id", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: Collection(random_name()),
    history: 0
  };
  let cname = doc.ref.raw.collection;

  let create = await fql_migrate(doc);
  let design = await client.query(schema());

  let migrate_id = crypto.createHash('sha512').update(JSON.stringify(doc)).digest('hex');
  assert.equal([migrate_id].toString(), design.map(x => x.data.migrate_id).toString());
});

test("fql_migrate: does not migrate an existing document", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: Collection(random_name()),
    history: 0
  };
  let cname = doc.ref.raw.collection;
  let migrate_id = crypto.createHash('sha512').update(JSON.stringify(doc)).digest('hex');

  let create = await fql_migrate(doc);
  let result = await fql_migrate(doc);

  assert.equal(JSON.stringify(create.map(x => x.toString())), JSON.stringify([doc.ref.toFQL()]));
  assert.equal(false, result);
});

test("fql_migrate: updates document :name", async (t) => {
  await client.query(drop_schema());
  let oname = random_name("old_name");
  let nname = random_name("new_name");
  let doc = {
    ref: Collection(oname),
    name: nname,
    history: 0
  };

  await fql_migrate(doc);
  let design = await client.query(schema());
  assert.equal([nname].toString(), design.map(x => x.name).toString());
});

test('fql_migrate: repeated migrates do not alter the database', async () => {
  await client.query(drop_schema());
  const name = random_name("new_name");
  const docs = [
    { ref: Collection(name+'0'), history: 0 },
    { ref: Collection(name+'1'), history: 0 },
  ];

  await fql_migrate(docs);
  await fql_migrate(docs);
  await fql_migrate(docs);

  let design = await client.query(schema());
  assert.equal(
    map_refs(docs).map(x => x.toFQL()).join(', '),
    map_refs(design).map(x => x.toString()).join(', ')
  );
});

test('fql_migrate: returns false if FQL is up-to-date', async () => {
  await client.query(drop_schema());
  const cname = random_name("migrate_all");
  const fql = {
    ref: q.Function(cname),
    body: q.Query( q.Lambda( [], q.Select(1, [0,1,2,3])))
  };
  await fql_migrate(fql);
  const last = await fql_migrate(fql);
  assert.equal(false, last);
});

test('fql_migrate: migrates if the FQL schema changed', async () => {
  await client.query(drop_schema());
  const cname1 = random_name("1");
  const fql1 = {
    ref: q.Function(cname1),
    body: q.Query( q.Lambda( [], q.Select(1, [0,1,2,3])))
  };
  await fql_migrate(fql1);

  const cname2 = random_name("2");
  const fql2 = {
    ref: q.Function(cname2),
    body: q.Query( q.Lambda( [], q.Select(2, [0,1,2,3])))
  };
  const last = await fql_migrate(fql2);
  assert.notEqual(false, last);
});
