import { describe, it } from "../src/Spec.ts";
import { assertEquals as EQUALS } from "https://deno.land/std/testing/asserts.ts";
import { FaunaDB } from "../src/FaunaDB.ts";

describe("FaunaDB");

it("does something", () => {
  const actual = new FaunaDB();
  EQUALS("", actual);
});

