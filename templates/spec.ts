import { describe, it, equals } from "{DA_PATH}/src/Spec.ts";
import { {Name} } from "../src/{Name}.ts";

describe("{Name}");

it("does something", () => {
  const actual = new {Name}();
  equals(actual, "expect");
});

