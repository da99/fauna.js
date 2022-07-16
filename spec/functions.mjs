
import test from 'node:test';
import crypto from 'node:crypto';

import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema, fql_migrate} from "../src/main.mjs";

const {Lambda, Query, Add, Var} = q;

// # =============================================================================
// # === Helpers: ================================================================
function random_name(s = "random") {
  return `${s}_${Date.now()}`;
} // function
// # =============================================================================

test("migrate: creates a function", async (t) => {
  await client.query(drop_schema());
  let doc = {
    ref: q.Function(random_name()),
    body: Query(Lambda("number", Add(1, Var("number"))))
  };
  let fname = doc.ref.raw.function;

  await fql_migrate(doc);
  let design = await client.query(schema());
  assert.equal([fname].toString(), design.map(x => x.name).toString());
});
