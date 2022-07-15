
import test from 'node:test';
import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema, fauna_migrate, graphql, graphql_migrate} from "../src/main.mjs";

// # =============================================================================
// # === Helpers: ================================================================
function random_name(s = "random") {
  return `${s}_${Date.now()}`;
} // function

function map_refs(arr) {
  return arr.map(x => x.ref);
} // function
// # =============================================================================

test("graphql_migrate: it updates the schema", async () => {
  await client.query(drop_schema());
  const cname = random_name("one_one");
  let doc = {
    ref: q.Function(cname),
    body: q.Query(
      q.Lambda(
        ["_"],
        q.Select(1, [0,1,2,3])
      )
    )
  };

  await client.query(fauna_migrate(doc));

  await graphql_migrate(`
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }
  `);

  const result = await graphql(`{ sayHello(name: "Jane") }`);
  assert.equal(1, result);
});
