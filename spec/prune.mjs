
import test from 'node:test';
import crypto from 'node:crypto';

import { strict as assert } from 'node:assert';
import {force_prune, prune_able, q, client, schema, drop_schema, fauna_migrate} from "../src/main.mjs";

const {If, Exists, Update, Create, Collection, CreateCollection} = q;

// # =============================================================================
// # === Helpers: ================================================================
// # =============================================================================
function random_name(s = "random") {
  return `${s}_${Date.now()}`;
} // function

function map_refs(arr) {
  return arr.map(x => x.ref);
} // function
// # =============================================================================


test("prune_able: it returns docs that are delete-able", async () => {
  await client.query(drop_schema());
  let c1 = random_name('c1');
  let c2 = random_name('c2');
  let c3 = random_name('c3');

  let old_docs = [c1,c2,c3].map(x => ({ ref: Collection(x), history: 0}));
  await client.query(fauna_migrate(old_docs));
  let old_design = await client.query(schema());

  let c4 = random_name('c4');
  let c5 = random_name('c5');
  let new_docs = [old_docs[1]].concat(
    [c4,c5].map(x => ({ref: Collection(x), history: 0}))
  );

  let delete_able = await client.query(prune_able(new_docs));

  assert.equal(
    JSON.stringify(map_refs([old_design[0], old_design[2]])),
    JSON.stringify(map_refs(delete_able))
  );
}); // test


test("force_prune: it removes old docs", async () => {
  await client.query(drop_schema());
  let c0 = random_name('c0');
  let c1 = random_name('c1');
  let c2 = random_name('c2');
  let c3 = random_name('c3');
  let c4 = random_name('c4');

  // Set up the old schema:
  const old_migrate = [c0,c1,c2,c3,c4].map(x => ({ ref: Collection(x), history: 0}));
  await client.query(fauna_migrate(old_migrate));

  // Set up the new schema:
  const new_migrate = [old_migrate[1], old_migrate[3]];
  await client.query(force_prune(new_migrate));

  // Get the current schema:
  let design = await client.query(schema());

  assert.equal(
    JSON.stringify(new_migrate.map(x => x.ref.toFQL())),
    JSON.stringify(design.map(x => x.ref.toString()))
  );
}); // test
