
import { split_whitespace } from "./String.ts";
import { run } from "./Process.ts";

const DEFAULT_CLIENT_VALUES = {
  secret:    "",
  port:      443,
  scheme:    "https",
  keepAlive: false,
  timeout:   5
}; // const

export const F: Fauna = {
  query: {
    // Paginate: {name: "Paginate", args: []}
  }
}; // const

const RESOURCE_TYPES = {
  role:       "roles",
  collection: "collections",
  function:   "functions",
  index:      "indexes"
};

type Expr = {
  readonly name: string;
  readonly args: any[];
  readonly is_expr: true;
  // [Deno.customInspect](): string;
} // class

type Methods = {
  [key: string]: Function
} // type

type Fauna = {
  query: Methods
} // type

type Privilege = {
  resource: Expr,
  actions: {
    read: boolean,
    write: boolean,
    create: boolean,
    delete: boolean,
    history_read: boolean,
    history_write: boolean,
    unrestricted_read: boolean
  }
} // type

type Old_Schema = {
  collections: [Param_Object],
  functions:   [Param_Object],
  indexes:     [Param_Object],
  roles:       [Param_Object]
} // type

type New_Schema = {
  collections: Param_Object_Group,
  functions:   Param_Object_Group,
  indexes:     Param_Object_Group,
  roles:       Param_Object_Group
} // type

interface Migrate_Action {
  action: string,
  resource_type: keyof New_Schema,
  resource_name: string,
  fql: Expr,
  param_object?: Param_Object,
  old_fql?: any
} // interface

interface Param_Object_Group {
 [key: string]: Param_Object
}

interface Param_Object_Data {
   hash_version?: string,
   [key: string]: any
}

interface Param_Object {
 ref?: Expr,
 name: string,
 privileges?: Array<Privilege>,
 history_days?: number,
 role?: Expr,
 body?: Expr,
 data?: Param_Object_Data
}

interface Client_Options {
  secret?: string,
  domain?: string,
}

type ENV = {
  [key: string]: string,
};

class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
} // export

interface ProcessResults {
  stdout: string | null,
  stderr: string | null,
  code: number,
  success: boolean
} // interface

export class ProcessError extends Error {
  results: ProcessResults;
  constructor(message: string, results: ProcessResults) {
    super(message);
    this.name = this.constructor.name;
    this.results = results;
  }
} // export

export function CreateExpr(name: string) {
  return (...args: any[]) : Expr => {
    return {
      name: name,
      args: args,
      is_expr: true,
      [Symbol.for("Deno.customInspect")](): string {
        return `${name}(${args.map((x: any) => Deno.inspect(x, {depth: Infinity})).join(', ')})`;
      }
    };
  };
} // function


// start macro: CreateExpr
export const Add = CreateExpr("Add");
export const Append = CreateExpr("Append");
export const Call = CreateExpr("Call");
export const Ceil = CreateExpr("Ceil");
export const Collection = CreateExpr("Collection");
export const Collections = CreateExpr("Collections");
export const Concat = CreateExpr("Concat");
export const ContainsField = CreateExpr("ContainsField");
export const ContainsPath = CreateExpr("ContainsPath");
export const ContainsStr = CreateExpr("ContainsStr");
export const ContainsStrRegex = CreateExpr("ContainsStrRegex");
export const ContainsValue = CreateExpr("ContainsValue");
export const Count = CreateExpr("Count");
export const Create = CreateExpr("Create");
export const CreateCollection = CreateExpr("CreateCollection");
export const CreateFunction = CreateExpr("CreateFunction");
export const CreateIndex = CreateExpr("CreateIndex");
export const CreateRole = CreateExpr("CreateRole");
export const CurrentIdentity = CreateExpr("CurrentIdentity");
export const Delete = CreateExpr("Delete");
export const Difference = CreateExpr("Difference");
export const Distinct = CreateExpr("Distinct");
export const Divide = CreateExpr("Divide");
export const Do = CreateExpr("Do");
export const Documents = CreateExpr("Documents");
export const Drop = CreateExpr("Drop");
export const EndsWith = CreateExpr("EndsWith");
export const Exists   = CreateExpr("Exists");
export const Epoch = CreateExpr("Epoch");
export const Filter = CreateExpr("Filter");
export const Functions = CreateExpr("Functions");
export const Fn = CreateExpr("Function");
export const Database = CreateExpr("Database");
export const Get = CreateExpr("Get");
export const GT = CreateExpr("GT");
export const GTE = CreateExpr("GTE");
export const Identify = CreateExpr("Identify");
export const If = CreateExpr("If");
export const Index = CreateExpr("Index");
export const Indexes = CreateExpr("Indexes");
export const Insert = CreateExpr("Insert");
export const Intersection = CreateExpr("Intersection");
export const IsArray = CreateExpr("IsArray");
export const IsBoolean = CreateExpr("IsBoolean");
export const IsEmpty = CreateExpr("IsEmpty");
export const IsNonEmpty = CreateExpr("IsNonEmpty");
export const IsNull = CreateExpr("IsNull");
export const IsNumber = CreateExpr("IsNumber");
export const IsSet = CreateExpr("IsSet");
export const IsString = CreateExpr("IsString");
export const IsTimestamp = CreateExpr("IsTimestamp");
export const IsToken = CreateExpr("IsToken");
export const Join = CreateExpr("Join");
export const LT = CreateExpr("LT");
export const LTE = CreateExpr("LTE");
export const LTrim = CreateExpr("LTrim");
export const Lambda = CreateExpr("Lambda");
export const Length = CreateExpr("Length");
export const Let = CreateExpr("Let");
export const Ln = CreateExpr("Ln");
export const LowerCase = CreateExpr("LowerCase");
export const Map = CreateExpr("Map");
export const Match = CreateExpr("Match");
export const Max = CreateExpr("Max");
export const Mean = CreateExpr("Mean");
export const Merge = CreateExpr("Merge");
export const Min = CreateExpr("Min");
export const Minute = CreateExpr("Minute");
export const Modulo = CreateExpr("Modulo");
export const Month = CreateExpr("Month");
export const Multiply = CreateExpr("Multiply");
export const Not = CreateExpr("Not");
export const Now = CreateExpr("Now");
export const Or = CreateExpr("Or");
export const Paginate = CreateExpr("Paginate");
export const Prepend = CreateExpr("Prepend");
export const Query = CreateExpr("Query");
export const RTrim = CreateExpr("RTrim");
export const Range = CreateExpr("Range");
export const Reduce = CreateExpr("Reduce");
export const RegexEscape = CreateExpr("RegexEscape");
export const Role = CreateExpr("Role");
export const Ref = CreateExpr("Ref");
export const Roles = CreateExpr("Roles");
export const Remove = CreateExpr("Remove");
export const Repeat = CreateExpr("Repeat");
export const Replace = CreateExpr("Replace");
export const ReplaceStr = CreateExpr("ReplaceStr");
export const ReplaceStrRegex = CreateExpr("ReplaceStrRegex");
export const Reverse = CreateExpr("Reverse");
export const Round = CreateExpr("Round");
export const Select = CreateExpr("Select");
export const Space = CreateExpr("Space");
export const StartsWith = CreateExpr("StartsWith");
export const SubString = CreateExpr("SubString");
export const Subtract = CreateExpr("Subtract");
export const Sum = CreateExpr("Sum");
export const Take = CreateExpr("Take");
export const Time = CreateExpr("Time");
export const TimeAdd = CreateExpr("TimeAdd");
export const TimeDiff = CreateExpr("TimeDiff");
export const TimeSubstract = CreateExpr("TimeSubstract");
export const TitleCase = CreateExpr("TitleCase");
export const ToArray = CreateExpr("ToArray");
export const ToDate = CreateExpr("ToDate");
export const ToDouble = CreateExpr("ToDouble");
export const ToInteger = CreateExpr("ToInteger");
export const ToString = CreateExpr("ToString");
export const ToTime = CreateExpr("ToTime");
export const Trim = CreateExpr("Trim");
export const Trunc = CreateExpr("Trunc");
export const Union = CreateExpr("Union");
export const Update = CreateExpr("Update");
export const UpperCase = CreateExpr("UpperCase");
export const Var = CreateExpr("Var");
// end macro


function CreateResource(r_type: keyof New_Schema, r: Param_Object) {
  switch (r_type) {
    case "functions":
      return CreateFunction(r);
    case "indexes":
      return CreateIndex(r);
    case "collections":
      return CreateCollection(r);
    case "roles":
      return CreateRole(r);
    default:
      throw new Error(`Invalid resource type: ${r_type}`);
  } // switch
} // function

function same_version(old_o: Param_Object, new_o: Param_Object) {
  const old_hash_version = (old_o.data || {}).hash_version;
  return old_hash_version === (new_o.data as Param_Object_Data).hash_version;
} // function

function find_name(arr: Array<Param_Object>, name_value: string) {
  return arr.find(x => x.name === name_value);
} // function

export async function run_in_node(raw_o: Client_Options, raw_body: any) {
  const body = Deno.inspect(raw_body, {depth: Infinity});
  const options = JSON.stringify(raw_o);
  const cmd = ["node", "src/Node-FaunaDB.mjs", options, body ];
  const result = await run({cmd});

  if (result.success) {
    return JSON.parse(result.stdout as string);
  }

  throw new ProcessError(`failed: ${cmd[0]} ${cmd[1]}`, {
    stdout: result.stdout,
    stderr: result.stderr,
    code: result.code,
    success: result.success
  });
} // function

export function Select_Map_Paginate(x: Expr) {
  return Select(
    "data",
    Map(
      Paginate(x),
      Lambda("x", Get(Var("x")))
    )
  );
} // func

export async function migrate(a_secret: string, b_secret: string) {
  return false;
} // export

export async function query(o: Client_Options, x: any) {
  try {
    return await run_in_node(o, x);
  } catch (e) {
    console.error("=== FQL: === ");
    console.error(Deno.inspect(x));
    console.error("============ ");
    throw e;
  }
} // export

export function drop(x: Expr) {
  return Map(
    Paginate(x),
    Lambda("x", Delete(Var("x")))
  );
} // export function

export async function clear(o: Client_Options) {
  return await query(o, Do(
    drop(Collections()),
    drop(Roles()),
    drop(Indexes()),
    drop(Functions())
  ));
} // export

export function delete_if_exists(x: any): Expr {
  return If(Exists(x), Delete(x), false);
} // export function

export function collection_names(): Expr {
  return Select("data", Map(
    Paginate(Collections()),
    Lambda("x", Select("name", Get(Var("x"))))
  ));
} // export function

export function select_keys(keys: string[], x: Expr) {
  const o: Record<string, Expr> = {};
  for (let k of keys) {
    if (k.indexOf('?') === k.length - 1) {
      const new_k = k.substring(0, k.length - 1);
      o[new_k] = Select(new_k, x, null);
    } else {
      o[k] = Select(k, x);
    }
  } // for
  return o;
} // export function

export function map_get(x: Expr, keys?: string[]) {
  let to_doc = Get(Var("x"));
  if (keys) {
    to_doc = Let(
      { doc: Get(Var("x")) },
      select_keys(keys, Var("doc"))
    ); // Let
  }
  return Map(
    Paginate(x),
    Lambda( "x", to_doc)
  ); // Map
} // export function

export function schema() {
  return({
    roles: Select("data", map_get(
      Roles(),
      ["ref", "name", "privileges", "data?"]
    )),
    collections: Select("data", map_get(
      Collections(),
      ["ref", "history_days", "name", "data?"]
    )),
    functions: Select("data", map_get(
      Indexes(),
      ["ref", "serialized", "name", "unique", "source", "terms", "values?", "data?"]
    )),
    indexes: Select("data", map_get(
      Functions(),
      ["ref", "name", "body", "role?", "data?"]
    ))
  });
} // export

export function diff_create(name: string, old: Expr, new_: Expr) {
  return Let({
    old: Select(name, old),
    new: Select(name, new_),
    fin: []
  },
  Filter(Var("new"), Lambda("r", Not(ContainsValue(Var("r"), Var("old"))))),
  );
} // export function

export function filter_a_not_in_b(a: Expr, b: Expr) {
  return Filter(a, Lambda("r", Not(ContainsValue(Var("r"), b))));
} // export function

export function diff_filter_a_not_in_b(args: string[], a: Expr, b: Expr) {
  return Append([filter_a_not_in_b(a, b)], args);
} // export function

export function concat_array(...args: Expr[]) {
  return args.reduce((old, curr) => {
    if (!old) { return curr; }
    return Append(curr, old);
  });
} // export function

export function diff(new_values: Record<string, any>) {
  return Let({
    new: new_values,
    old: schema()
  },
  [
    diff_filter_a_not_in_b(
      ["create", "collections"],
      Select("collections", Var("new")),
      Select("collections", Var("old"))
    ),
    // roles: [],
    // indexes: [],
    // functions: []
  ]
 );
} // export function

// CreateRole({
//   name: "cloudflare_worker_function",
//   privileges: [
//     {
//       resource: Collection("screen_name"),
//       actions: {
//         read: true,
//         write: true,
//         create: true,
//         delete: false,
//         history_read: false,
//         history_write: false,
//         unrestricted_read: false
//       }
//     }
//   ]
// }) ;

