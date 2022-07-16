
import test from 'node:test';

import { strict as assert } from 'node:assert';
import {q, client, drop_schema, migrate, graphql} from "../src/main.mjs";

// # =============================================================================
// # === Helpers: ================================================================
function random_name(s = "random") {
  return `${s}_${Date.now()}`;
} // function
// # =============================================================================

test('migrate: returns false if both FQL and GQL are up-to-date', async () => {
  await client.query(drop_schema());
  const cname = random_name("migrate_all");
  const fql = {
    ref: q.Function(cname),
    body: q.Query( q.Lambda( [], q.Select(1, [0,1,2,3])))
  };

  const gql = `
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }`;

  await migrate(fql, gql);
  const last = await migrate(fql, gql);
  assert.equal(false, last);
});

test("migrate: it updates the graphql schema", async () => {
  await client.query(drop_schema());
  const cname = random_name("migrated");
  const fql = {
    ref: q.Function(cname),
    body: q.Query( q.Lambda( [], q.Select(2, [0,1,2,3])))
  };

  const gql = `
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }
  `;

  await migrate(fql, gql);

  const result = await graphql(`{
    one: ${cname}
  }`);
  assert.deepEqual({ data: {one: 2} }, result);
});
