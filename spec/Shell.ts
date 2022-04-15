import { describe, it, equals } from "../src/Spec.ts";
import { stringy, lines, columns, Lines, Columns } from "../src/Shell.ts";

console.error("----")
describe("Shell.ts stringy.split_whitespace");

it("splits the value", () => {
  const actual = stringy("e n d").split_whitespace().value;
  equals(actual, ["e", "n", "d"]);
});

it("returns a Lines instance", () => {
  const actual = stringy("e n d").split_whitespace();
  equals(actual.constructor, Lines);
});

