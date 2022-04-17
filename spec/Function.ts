import { describe, it, equals } from "../src/Spec.ts";
import { not, is_number, is_string } from "../src/Function.ts";

// =============================================================================
describe("is_number");
// =============================================================================

it("returns true if value type is: number", () => {
  equals(is_number(5), true);
});

it("returns false if value type is: string", () => {
  equals(is_number("5"), false);
});

// =============================================================================
describe("is_string");
// =============================================================================

it("returns true if value type is: string", () => {
  equals(is_string("6"), true);
});

it("returns false if value type is: number", () => {
  equals(is_string(6), false);
});

// =============================================================================
describe("not");
// =============================================================================

it("returns true if origin function returns false", () => {
  const f = not(is_number)
  equals(not(is_number)("5"), true)
});

