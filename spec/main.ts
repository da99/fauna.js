
import { evan, describe, it, Assert } from "../src/Evan";
import type { It } from "../src/Evan";

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

