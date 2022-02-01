
import { split } from "./String.ts";

type Methods = {
  [key: string]: Function
} // type

type Fauna = {
  query: Methods
} // type

const F: Fauna = {
  query: {
    // Paginate: {name: "Paginate", args: []}
  }
}; // const

function new_expr(name: string) {
  return function(...args: any) {
    return {
      name,
      args: args,
      [Deno.customInspect]() {
        return `${name}(${args.map((x: any) => Deno.inspect(x)).join(', ')})`;
      }
    };
  };
} // function

class Expr {
  name: string;
  args: Array<Expr>;
  constructor(name: string) {
    this.name = name;
    this.args = [];
  } // constructor
} // class

for(const name of new Set(split(`
  Paginate
  Collections
  Get
  Function
  Database
  Query
  Create
  CreateFunction
  Collection
  Var
  LowerCase
  Ref
  Lambda
  Select
  Map
  Functions
  Indexes
  Role
  CreateRole
  Roles
  Equals
`))) {
  F.query[name] = new_expr(name);
} // for


export { F };
