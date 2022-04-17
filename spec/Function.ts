import { describe, it, equals } from "../src/Spec.ts";
import {
  not, or, and,
  is_number, is_string, is_null,
  is_true, is_false, is_boolean
} from "../src/Function.ts";

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
  equals(f("5"), true)
});

it("returns false if one of the functions returns true", () => {
  const f = not(is_number, is_string, is_null)
  equals(f(null), false)
});

it("returns true if all of the functions returns false", () => {
  const f = not(is_number, is_string, is_null)
  equals(f(undefined), true)
});


// =============================================================================
describe("and");
// =============================================================================

it("returns true if origin function returns true", () => {
  const f = and(is_number)
  equals(f(5), true)
});

it("returns true if all of the functions returns true", () => {
  const f = and(is_true, is_boolean, not(is_null))
  equals(f(true), true)
});

it("returns false if one of the functions returns false", () => {
  const f = and(is_true, is_boolean, is_false)
  equals(f(true), false)
});



// =============================================================================
describe("or");
// =============================================================================

it("returns true if origin function returns true", () => {
  const f = or(is_number)
  equals(f(5), true)
});

it("returns true if one of the functions returns true", () => {
  const f = or(is_number, is_string, is_null)
  equals(f(null), true)
});

it("returns false if all of the functions returns false", () => {
  const f = or(is_number, is_string, is_null)
  equals(f(undefined), false)
});

