
import { describe, it, equals } from "https://github.com/da99/da.ts/raw/main/src/Spec.ts";
import { raw_inspect } from "https://github.com/da99/da.ts/raw/main/src/CLI.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import {
  drop_schema, schema, query, new_ref, migrate,
  Select, CreateCollection, CreateFn, Collection, Collections,
  Lambda,
  Do, If, Exists, Query, Fn,
  delete_if_exists, collection_names,
MigrateCollection, MigrateFn
} from "../src/fauna.ts";

import type {Schema, Schema_Doc, New_Schema, New_Doc, Expr, Collection_Doc} from "../src/fauna.ts";

const MIGRATE_FILE = "tmp/spec/schema.test.txt";

// # =============================================================================
// # === Helpers: ================================================================
// # =============================================================================
function random_name(s: string) {
  return `${s}_${Date.now()}`;
} // function

function to_refs(x: Schema) {
  return x.map(x1 => x1.ref);
} // function

function to_new_refs(x: New_Schema) {
  return x.map(d => new_ref(d));
} // function

function remove(k: string) {
  return function (x: Record<string, any>) {
    const y = Object.assign({}, x);
    delete y[k];
    return y;
  };
} // function

function standardize_schema(x: Schema) {
  return x.map((s: Schema_Doc) => {
    if (s.ref && s.ref.name === "Collection") {
      const doc = s as Collection_Doc;
      return {"name": doc.name, "history_days": doc.history_days};
    }
    return s;
  });
} // function

export function slow() {
  // # =============================================================================
  describe("query(...)");

  it("executes the query", async function () {
    const expected = "c";
    const actual   = await query(Select(2, "a b c d e f".split(' ')));
    equals(actual, expected);
  }); // it async

  // # =============================================================================
  describe("drop_schema()");

  it("drops from the database: collections, roles, indexes, functions", async function () {
    await query(CreateCollection({name: random_name("coll")}));
    await query(drop_schema());
    const actual = await query(schema());
    equals(actual, []);
  }); // it async

  // # =============================================================================
  describe("schema(...)");

  it("retrieves schema from database", async () => {
    await query(drop_schema());
    const name = random_name("coll");
    const doc  = await query(
      CreateCollection({name, history_days: 0})
    );
    const standard_doc = {
      name,
      ref: doc.ref,
      history_days: doc.history_days,
    };
    const expected = [ standard_doc ];
    const actual   = await query(schema());

    equals(actual.map(remove("ts")), expected);
  }); // it async

  it("converts Function refs to Function(..) format", async function () {
    await query(drop_schema());
    const name = random_name("helloF");
    const doc  = {
      name,
      body: Query(
        Lambda(
          "_",
          Select(1, [0,1,2])
        )
      )
    };
    await query( CreateFn(doc));
    const expected = [ {...doc, ref: Fn(name)} ];
    const actual   = await query(schema());

    equals(actual.map(remove("ts")), expected);
  }); // it async

  // # =============================================================================
  describe("MigrateX(...)");

  it("executes new schema", async function () {
    // await query(drop_schema());
    const dogs = random_name("dogs");
    const kittens = random_name("kittens");
    const gimme1 = random_name("gimme1");
    const new_schema = [
      MigrateCollection({
        name: dogs,
        history_days: 3
      }),
      MigrateCollection({
        name: kittens,
        history_days: 1
      }),
      MigrateFn({
        name: gimme1,
        body: Query(
          Lambda( "_", Select(1, [1,2,3]))
        )
      })
    ];
    const actual = await query(
      Do(new_schema)
    );
    equals(to_refs(actual), [Collection(dogs), Collection(kittens), Fn(gimme1)]);
  }); // it async

  // # =============================================================================
  describe("migrate(...)");

  it("returns false if shema is up-to-date", async function () {
    const new_schema = [
      MigrateCollection({ name: random_name("dogs") }),
      MigrateCollection({ name: random_name("kittens") })
    ];
    const current = await query(schema());
    Deno.writeTextFileSync(MIGRATE_FILE, `${raw_inspect(current)} ${raw_inspect(new_schema)}`);
    const actual = await migrate(new_schema, MIGRATE_FILE);
    equals(actual, false);

  }); // it async

  it("writes new schema to file", async function () {
    await query(drop_schema());
    const new_schema = [
      MigrateCollection({ name: random_name("unicorn") }),
      MigrateCollection({ name: random_name("rainbow") })
    ];
    const updated_schema = await migrate(new_schema, MIGRATE_FILE);
    const expected = `${raw_inspect(updated_schema)} ${raw_inspect(new_schema)}`;
    const actual = Deno.readTextFileSync(MIGRATE_FILE);
    equals(actual, expected);
  }); // it async

} // export function




