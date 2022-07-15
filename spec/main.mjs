
import test from 'node:test';
import crypto from 'node:crypto';

import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema} from "../src/main.mjs";

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

