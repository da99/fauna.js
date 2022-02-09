import { describe, it } from "../src/Spec.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";
import {
  clear, diff, migrate, schema, query,
  Select, CreateCollection, Collection,
  If, Exists,
  delete_if_exists, collection_names,
} from "../src/FaunaDB.ts";

async function show_error(f: () => Promise<void>) {
  try {
    return await f();
  } catch (e) {
    if (e.name === "ProcessError") {
      console.error(e.results);
      console.error(e.results.stderr);
    }
    throw e;
  }
} // async

const options = {
  secret: Deno.env.get("FAUNA_SECRET_TEST_A") || ""
};

describe("query(...)");

it("executes the query", async function () {
  await show_error(async () => {
    const expected = "c";
    const actual   = await query(options, Select(2, "a b c d e f".split(' ')));
    EQUALS(actual, expected);
  });
}); // it async

describe("schema(...)");

it("retrieves schema from database", async () => {
  await show_error(async () => {
    const expected = {collections: [], functions: [], indexes: [], roles: []};
    const actual   = await query(options, schema());

    EQUALS(Object.keys(actual).sort(), Object.keys(expected).sort());
  });
});

describe("diff(...)");

it("retrieves schema diff from database", async function () {
  const coll1 = {name: "coll1", history_days: 0};
  const q = {
    collections: [coll1],
    roles: [],
    indexes: [],
    functions: []
  };

  const e = [
    ["create", "collections", coll1]
  ];

  await show_error(async () => {
    const actual = await query(options, diff(q));
    // console.error(Deno.inspect(diff(q), {depth: Infinity}));
    // console.error(actual)
    EQUALS(actual, e);
  }); // await
}); // it async

