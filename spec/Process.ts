import { describe, it } from "../src/Spec.ts";
import { daEquals } from "./_.helper.ts";
import { run_or_throw, run } from "../src/Process.ts";

// =============================================================================
describe("run");

it("accepts a string", async () => {
  const {stdout} = await run("echo a b c");
  daEquals(stdout, "a b c\n");
});

it("accepts a Array<string>", async () => {
  const {stdout} = await run(["echo", "1", "2", "3"]);
  daEquals(stdout, "1 2 3\n");
});

it("returns STDOUT output", async function () {
  const {stdout} = await run("echo 4 5 6");
  daEquals(stdout, "4 5 6\n");
}); // it async

it("returns STDERR output", async function () {
  const {stderr} = await run(["node", "1", "2", "3"]);
  daEquals(stderr.match("Error: Cannot find module"), ["Error: Cannot find module"]);
}); // it async

it("returns status w/code", async function () {
  const {status} = await run(["node", "1", "2", "3"]);
  daEquals(status.code, 1);
}); // it async

it("returns status w/success boolean", async function () {
  const {status} = await run(["node", "1", "2", "3"]);
  daEquals(status.success, false);
}); // it async

// =============================================================================
describe("run_or_throw(...)");

it("throws if result is not success", async function () {
  let msg = null;
  try {
    await run_or_throw("node 1 2 3");
  } catch (err) {
    msg = err.message;
  }
  daEquals(msg, "Exit 1: node 1 2 3");
}); // it async

