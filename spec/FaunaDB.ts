import { describe, it } from "../src/Spec.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";
import {
  clear, migrate, schema, query,
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

describe("schema({secret...})");

it("retrieves schema from database", async () => {
  await show_error(async () => {
    const expected = {collection: [], function: [], index: [], role: []};
    const actual   = await schema(options);

    EQUALS(actual, expected);
  });
});

