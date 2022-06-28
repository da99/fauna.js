
import test from 'node:test';
import crypto from 'node:crypto';

import { strict as assert } from 'node:assert';
import {prune_able, q, client, schema, drop_schema, migrate} from "../src/main.mjs";

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
  await client.query(migrate(old_docs));
  let old_design = await client.query(schema());

  let c4 = random_name('c4');
  let c5 = random_name('c5');
  let new_docs = [old_docs[1]].concat(
    [c4,c5].map(x => ({ref: Collection(x), history: 0}))
  );

  let delete_able = prune_able(await client.query(schema()), new_docs);

  assert.equal(
    JSON.stringify(map_refs([old_design[0], old_design[2]])),
    JSON.stringify(map_refs(delete_able))
  );
});
