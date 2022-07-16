
import test from 'node:test';
import { strict as assert } from 'node:assert';
import {q, client, schema, drop_schema, fql_migrate, gql_query, gql_migrate} from "../src/main.mjs";
import { random_name } from "./_helper.mjs";


test("gql_migrate: it returns 'Schema imported successfully'", async () => {
  await client.query(drop_schema());
  const cname = random_name("one_one");
  let doc = {
    ref: q.Function(cname),
    body: q.Query( q.Lambda( [], q.Select(1, [0,1,2,3])))
  };

  const resp = await gql_migrate(`
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }
  `);

  assert.equal('Schema imported successfully', resp.match('Schema imported successfully')[0]);
});

test("gql_migrate: it updates the schema", async () => {
  await client.query(drop_schema());
  const cname = random_name("one_one");
  let doc = {
    ref: q.Function(cname),
    body: q.Query(
      q.Lambda(
        [],
        q.Select(1, [0,1,2,3])
      )
    )
  };

  await fql_migrate(doc);

  await gql_migrate(`
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }
  `);

  const result = await gql_query(`{
    one: ${cname}
  }`);
  assert.deepEqual({ data: {one: 1} }, result);
});

test("gql_migrate: it returns false if GraphQL is up-to-date", async () => {
  await client.query(drop_schema());
  const cname = random_name("one_one");
  await gql_migrate(`
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }
  `);
  const last = await gql_migrate(`
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }
  `);

  assert.equal(false, last);
});


test('gql_migrate: migrates if the GQL schema changed', async () => {
  await client.query(drop_schema());
  const cname = random_name("one_one");
  await gql_migrate(`
    type Query {
      ${cname}: Int! @resolver(name: "${cname}")
    }
  `);
  const last = await gql_migrate(`
    type Query {
      ${cname}1: Int! @resolver(name: "${cname}")
    }
  `);

  assert.notEqual(false, last);
});

