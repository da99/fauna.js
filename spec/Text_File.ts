import { describe, it } from "../src/Spec.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Text_File, find_parent_file } from "../src/FS.ts";

describe("Text_File.find_parent_file");

it("finds file within same directory", () => {
  const actual = find_parent_file("test", "bin/");
  assertEquals("bin/test", actual);
});

it("finds file within parent directory", () => {
  const actual = find_parent_file("test", "bin/a/b/c/d/e/f/main.ts");
  assertEquals("bin/test", actual);
});

it("returns null if file not found", () => {
  const actual = find_parent_file("run", "none/a/b/c/d/e/f/main.ts");
  assertEquals(null, actual);
});
