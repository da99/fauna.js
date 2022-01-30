
import * as FS from "fs";
import { Evan, evan, describe, it, Assert, State } from "../src/Evan";
import type { It } from "../src/Evan";

// =============================================================================
describe("Evan");

it("allows you to retrieve the state.", (assert: Assert)=>{
  const v = typeof evan.state;
  assert.equal("object", v);
});

it("passes on deepEqual equality.", (assert: Assert)=>{
  assert.deepEqual({a: "a"},{a: "a"});
});

it("fails on deepEqual in-equality.", (assert: Assert)=>{
  assert.deepEqual({a: "a"},{b: "a"});
});

it("accepts async functions.", async (assert: Assert) => {
  const result = await Promise.resolve("pass");
  assert.equal("pass", result);
});

it("fails if asserts are not made.", (assert: Assert) => "Nothing");

// =============================================================================
function flatten_titles(x : State) {
  return x.map((it: any) => (it.describe || it.it)).join(" ");
}

// =============================================================================
describe("evan.state_kv");
it("returns the tests in KV format", (assert: Assert) => {
  const e = new Evan();
  e.it("a1", () => {});
  e.it("a2", () => {});
  e.it("a3", () => {});
  assert.equal("a1 a2 a3", Object.keys(e.state_kv).join(" "));
});

it("includes 'describe' in the key", (assert: Assert) => {
  const e = new Evan();
  e.describe("Something");
  e.it("a1", () => {});
  e.it("a3", () => {});
  assert.equal("Something a1 Something a3", Object.keys(e.state_kv).join(" "));
});


// =============================================================================
describe("evan.filter");
it("removes values that fail the filter function", function (assert: Assert) {
  const e = new Evan();
  e.describe("something")
  e.it("1", () => { });
  e.it("2", () => { });
  e.it("3", () => { });
  e.filter((x: any) => x.it !== "3" );
  assert.equal("something 1 2", flatten_titles(e.state));
}); // it

// =============================================================================
describe("evan.filterIt");
it("removes tests that fail the filter function", function (assert: Assert) {
  const e = new Evan();
  e.describe("Main");
  e.it("1", () => { });
  e.it("2", () => { });
  e.it("3", () => { });
  e.filterIt((x: It) => x.it !== "2" );
  assert.equal("Main 1 3", flatten_titles(e.state));
}); // it

// =============================================================================
describe("evan.save_to_file");
it("saves file", function (assert: Assert) {
  const e = new Evan();
  e.it("1c", () => { });
  e.it("2b", () => { });
  e.it("3a", () => { });
  e.save_to_file("tmp/a.json");
  const json = JSON.parse(FS.readFileSync("tmp/a.json", {encoding:'utf8', flag:'r'}));
  const result = Object.keys(new Evan(json).state_kv).join(" ");
  assert.equal("1c 2b 3a", result);
}); // it

// =============================================================================
describe("evan.load_from_file");
it("restrieves previous state", function (assert: Assert) {
  const e = new Evan();
  e.it("1e", () => { });
  e.it("2e", () => { });
  e.it("3e", () => { });
  e.save_to_file("tmp/b.json");
  const new_e = Evan.load_from_file("tmp/b.json");
  assert.equal("1e 2e 3e", Object.keys(new_e.state_kv).join(" "));
}); // it

(async function main() {
  await evan.run();
  evan.forEachIt((it: It) => {
    if (it.it.indexOf("fails ") === 0) {
      it.pass = !it.assert.pass;
    }
  }) // for

  // evan.forEachIt(console.log)
  //   console.log(it);
  // }) // for
  evan.print();
})();

