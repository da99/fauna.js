import { describe, it } from "../src/Spec.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";
import { Text_File, find_parent_file } from "../src/Text_File.ts";

describe("Text_File.find_parent_file");

it("finds file within same directory", () => {
  const actual = find_parent_file("main.ts", "spec/");
  EQUALS("spec/main.ts", actual);
});

it("finds file within parent directory", () => {
  const actual = find_parent_file("main.ts", "spec/a/b/c/d/e/f/main.ts");
  EQUALS("spec/main.ts", actual);
});

it("returns null if file not found", () => {
  const actual = find_parent_file("main.ts", "none/a/b/c/d/e/f/main.ts");
  EQUALS(null, actual);
});
