import { describe, it, equals } from "https://raw.githubusercontent.com/da99/da.ts/main/src/Spec.ts";
import { {Name} } from "../src/{Name}.ts";

describe("{Name}");

it("does something", () => {
  const actual = new {Name}();
  equals("", actual);
});

