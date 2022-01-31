

import { Text_File } from "../src/Text_File.ts";
import { Evan, evan, describe, it, State } from "../src/Evan.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";
import type { It } from "../src/Evan.ts";

function flatten_titles(x : State) {
  return x.map((it: any) => (it.describe || it.it)).join(" ");
}

// // =============================================================================
describe("Evan");

it("allows you to retrieve the state.", ()=>{
  const v = typeof evan.state;
  EQUALS("object", v);
});

it("passes on deep equality.", ()=>{
  EQUALS({a: "a"},{a: "a"});
});

it("fails on deep in-equality.", ()=>{
  EQUALS({a: "a"},{b: "a"});
});

it("accepts async functions.", async () => {
  const result = await Promise.resolve("pass");
  EQUALS("pass", result);
});

// =============================================================================
describe("evan.its");
it("returns tests.", () => {
  const e = new Evan();
  const f = () => { EQUALS(1,2)};
  e.it("a2", () => {});
  e.it("a1", f);
  e.it("a3", () => {});
  EQUALS("a2 a1 a3", flatten_titles(e.its));
});

// =============================================================================
describe("evan.fails");
it("returns the tests that failed.", async () => {
  const e = new Evan();
  const f = () => { EQUALS(1,2)};
  e.it("a2", () => {});
  e.it("a1", f);
  e.it("a3", () => {});
  await e.run();
  EQUALS("a1", e.fails[0].it);
  EQUALS(1, e.fails.length);
});

// =============================================================================
describe("evan.has_fails");
it("returns true if there are failures.", async () => {
  const e = new Evan();
  e.it("a2", () => {});
  e.it("a1", () => { EQUALS(1,2)});
  e.it("a3", () => {});
  await e.run();
  EQUALS(true, e.has_fails);
});

it("returns false if all tests pass.", async () => {
  const e = new Evan();
  e.it("a2", () => { 1; });
  e.it("a1", () => { EQUALS(2,2)});
  e.it("a3", () => {});
  await e.run();
  EQUALS(false, e.has_fails);
});

// =============================================================================
describe("evan.state_kv");
it("returns the tests in KV format", () => {
  const e = new Evan();
  e.it("a1", () => { 1; });
  e.it("a2", () => {});
  e.it("a3", () => {});
  EQUALS("a1 a2 a3", Object.keys(e.state_kv).join(" "));
});

it("includes 'describe' in the key", () => {
  const e = new Evan();
  e.describe("Something");
  e.it("a1", () => {});
  e.it("a3", () => {});
  EQUALS("Something a1 Something a3", Object.keys(e.state_kv).join(" "));
});


// =============================================================================
describe("evan.filter");
it("removes values if the filter function returns true", function () {
  const e = new Evan();
  e.describe("something")
  e.it("1", () => { });
  e.it("2", () => { });
  e.it("3", () => { });
  e.filter((x: any) => x.it !== "3" );
  EQUALS("something 1 2", flatten_titles(e.state));
}); // it

// // =============================================================================
describe("evan.filterIt");
it("removes tests that return true for the filter function", function () {
  const e = new Evan();
  e.describe("Main");
  e.it("1", () => { });
  e.it("2", () => { });
  e.it("3", () => { });
  e.filterIt((x: It) => x.it !== "2" );
  EQUALS("Main 1 3", flatten_titles(e.state));
}); // it


(async function main() {
  await evan.run_last_fail("tmp/spec.fail.txt", (e: Evan) => {
    e.forEachIt((it: It) => {
      if (it.it.indexOf("fails ") === 0) {
        it.pass = !it.pass;
      }
    }) // for
  });
  evan.print();
})();


// export { };
