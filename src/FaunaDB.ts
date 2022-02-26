
import { run } from "./Process.ts";
import { inspect, raw_inspect } from "./CLI.ts";
import { deepEqual } from "https://deno.land/x/cotton@v0.7.3/src/utils/deepequal.ts";

const DEFAULT_CLIENT_VALUES = {
  secret:    "",
  port:      443,
  scheme:    "https",
  keepAlive: false,
  timeout:   5
}; // const

export type Expr = {
  readonly name: string;
  readonly args: any[];
  // [Deno.customInspect](): string;
} // class

export type Schema_Ref_Collection = "Collection" | "Index" | "Fn" | "Role" ;

export type Schema_Doc = Collection_Record | Index_Record | Fn_Record | Role_Record ;
export type Schema     = Array<Schema_Doc>;

export type New_Schema = Array<New_Spec>;
export type New_Spec   = Collection_Spec | Index_Spec | Fn_Spec | Role_Spec;
export type New_Doc    = New_Collection | New_Index | New_Fn | New_Role;

interface Client_Options {
  secret?: string,
  domain?: string,
}

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

interface Index_Term {
  field?: string[] | string,
  binding?: string
} // interface

interface Index_Value {
  field? : string[],
  binding: string,
  reverse: boolean
} // interface

interface Schema_Ref<T extends Schema_Ref_Collection> {
  name: T;
  id: string
} // interface

export interface Index_Spec {
  coll: "Index";
  doc: New_Index;
} // interface

export interface New_Index {
  name: string;
  source: Expr;
  terms: Array<Index_Term>;
  values?: Array<Index_Value>;
  unique: boolean;
} // interface

export interface Index_Record extends New_Index {
  ref: Schema_Ref<"Index">;
  ts: number;
} // interface

export interface Role_Spec {
  Role: New_Role;
} // interface

export interface New_Role {
  name: string;
  privileges: Array<Privilege>;
} // interface

export interface Role_Record extends New_Role {
  ref: Schema_Ref<"Role">;
  ts: number;
} // interface

export interface Collection_Spec {
  Collection: New_Collection;
} // interface

export interface New_Collection {
  name: string;
  history_days?: number;
} // interface

export interface Collection_Record extends New_Collection {
  ref: Schema_Ref<"Collection">;
  ts: number;
} // interface

export interface Fn_Spec {
  Fn: New_Fn;
} // interface

export interface New_Fn {
  name: string;
  body: Expr;
} // interface

export interface Fn_Record extends New_Fn {
  ref: Schema_Ref<"Fn">;
  ts: number;
} // interface

// start macro: create_expr
export const Add              = create_expr("Add");
export const Append           = create_expr("Append");
export const Call             = create_expr("Call");
export const Ceil             = create_expr("Ceil");
export const Collections      = create_expr("Collections");
export const Concat           = create_expr("Concat");
export const ContainsField    = create_expr("ContainsField");
export const ContainsPath     = create_expr("ContainsPath");
export const ContainsStr      = create_expr("ContainsStr");
export const ContainsStrRegex = create_expr("ContainsStrRegex");
export const ContainsValue    = create_expr("ContainsValue");
export const Count            = create_expr("Count");
export const Create           = create_expr("Create");
export const CurrentIdentity  = create_expr("CurrentIdentity");
export const Difference       = create_expr("Difference");
export const Distinct         = create_expr("Distinct");
export const Divide           = create_expr("Divide");
export const Do               = create_expr("Do");
export const Documents        = create_expr("Documents");
export const Drop             = create_expr("Drop");
export const EndsWith         = create_expr("EndsWith");
export const Exists           = create_expr("Exists");
export const Epoch            = create_expr("Epoch");
export const Equals           = create_expr("Equals");
export const Filter           = create_expr("Filter");
export const Functions        = create_expr("Functions");
export const Foreach          = create_expr("Foreach");
export const Database         = create_expr("Database");
export const Get              = create_expr("Get");
export const GT               = create_expr("GT");
export const GTE              = create_expr("GTE");
export const Identify         = create_expr("Identify");
export const If               = create_expr("If");
export const Indexes          = create_expr("Indexes");
export const Insert           = create_expr("Insert");
export const Intersection     = create_expr("Intersection");
export const IsArray          = create_expr("IsArray");
export const IsBoolean        = create_expr("IsBoolean");
export const IsCollection     = create_expr("IsCollection");
export const IsEmpty          = create_expr("IsEmpty");
export const IsFunction       = create_expr("IsFunction");
export const IsIndex          = create_expr("IsIndex");
export const IsNonEmpty       = create_expr("IsNonEmpty");
export const IsNull           = create_expr("IsNull");
export const IsNumber         = create_expr("IsNumber");
export const IsSet            = create_expr("IsSet");
export const IsString         = create_expr("IsString");
export const IsRef            = create_expr("IsRef");
export const IsRole           = create_expr("IsRole");
export const IsTimestamp      = create_expr("IsTimestamp");
export const IsToken          = create_expr("IsToken");
export const Join             = create_expr("Join");
export const LT               = create_expr("LT");
export const LTE              = create_expr("LTE");
export const LTrim            = create_expr("LTrim");
export const Lambda           = create_expr("Lambda");
export const Length           = create_expr("Length");
export const Let              = create_expr("Let");
export const Ln               = create_expr("Ln");
export const LowerCase        = create_expr("LowerCase");
export const Map              = create_expr("Map");
export const Match            = create_expr("Match");
export const Max              = create_expr("Max");
export const Mean             = create_expr("Mean");
export const Merge            = create_expr("Merge");
export const Min              = create_expr("Min");
export const Minute           = create_expr("Minute");
export const Modulo           = create_expr("Modulo");
export const Month            = create_expr("Month");
export const Multiply         = create_expr("Multiply");
export const Not              = create_expr("Not");
export const Now              = create_expr("Now");
export const Or               = create_expr("Or");
export const Paginate         = create_expr("Paginate");
export const Prepend          = create_expr("Prepend");
export const Query            = create_expr("Query");
export const RTrim            = create_expr("RTrim");
export const Range            = create_expr("Range");
export const Reduce           = create_expr("Reduce");
export const RegexEscape      = create_expr("RegexEscape");
export const Ref              = create_expr("Ref");
export const Roles            = create_expr("Roles");
export const Remove           = create_expr("Remove");
export const Repeat           = create_expr("Repeat");
export const Replace          = create_expr("Replace");
export const ReplaceStr       = create_expr("ReplaceStr");
export const ReplaceStrRegex  = create_expr("ReplaceStrRegex");
export const Reverse          = create_expr("Reverse");
export const Round            = create_expr("Round");
export const Select           = create_expr("Select");
export const Space            = create_expr("Space");
export const StartsWith       = create_expr("StartsWith");
export const SubString        = create_expr("SubString");
export const Subtract         = create_expr("Subtract");
export const Sum              = create_expr("Sum");
export const Take             = create_expr("Take");
export const Time             = create_expr("Time");
export const TimeAdd          = create_expr("TimeAdd");
export const TimeDiff         = create_expr("TimeDiff");
export const TimeSubstract    = create_expr("TimeSubstract");
export const TitleCase        = create_expr("TitleCase");
export const ToArray          = create_expr("ToArray");
export const ToDate           = create_expr("ToDate");
export const ToObject         = create_expr("ToObject");
export const ToDouble         = create_expr("ToDouble");
export const ToInteger        = create_expr("ToInteger");
export const ToString         = create_expr("ToString");
export const ToTime           = create_expr("ToTime");
export const Trim             = create_expr("Trim");
export const Trunc            = create_expr("Trunc");
export const Union            = create_expr("Union");
export const UpperCase        = create_expr("UpperCase");
export const Var              = create_expr("Var");

export const Collection = create_schema_ref("Collection");
export const Fn         = create_schema_ref("Fn");
export const Index      = create_schema_ref("Index");
export const Role       = create_schema_ref("Role");

export const Delete = create_expr_ref("Delete");
export const Update = function (id: Schema_Ref<any>, doc: New_Doc): Expr {
  return {
    name: "Update",
    args: [id, doc],
    [Symbol.for("Deno.customInspect")](x: any): string {
      return `Update(${[id, doc].map((x: any) => raw_inspect(x)).join(', ')})`;
    }
  };
};

export function create_schema_ref<T extends Schema_Ref_Collection>(name: T) {
  return (id: string): Schema_Ref<T> => {
    return {
      name: name,
      id: id,
      [Symbol.for("Deno.customInspect")](): string {
        return `${name}(${raw_inspect(id)})`;
      }
    };
  };
} // export function

export function create_expr(name: string) {
  return (...args: any[]) : Expr => {
    return {
      name: name,
      args: args,
      [Symbol.for("Deno.customInspect")](...a: any[]): string {
        return `${name}(${args.map((x: any) => raw_inspect(x)).join(', ')})`;
      }
    };
  };
} // function

export function create_expr_ref(name: string) {
  return (r: Schema_Ref<any> | Expr) : Expr => {
    return {
      name: name,
      args: [r],
      [Symbol.for("Deno.customInspect")](): string {
        return `${name}(${[r].map((x: any) => raw_inspect(x)).join(', ')})`;
      }
    };
  };
} // function

export function CreateIndex(i: New_Index): Expr {
  return create_expr("CreateIndex")(i);
} // export function

export function CreateFunction(f: New_Fn): Expr {
  return create_expr("CreateFunction")(f);
} // export function

export function CreateCollection(coll: New_Collection): Expr {
  return create_expr("CreateCollection")(coll);
} // export function

export function CreateRole(role: New_Role) : Expr {
  return create_expr("CreateRole")(role);
} // function

// # =============================================================================
// # === Node Process Functions ==================================================
// # =============================================================================
export async function node(...args: string[]) {
  return await run({
    cmd: [
      "node",
      "src/Node-FaunaDB.mjs",
      ...args
    ]
  });
} // export

export async function inherit_node(...args: string[]) {
  const result = await run({
    cmd: [
      "node",
      "src/Node-FaunaDB.mjs",
      ...args
    ],
    stderr: "inherit",
    stdout: "inherit"
  });

  if (!result.success) {
    throw Error("Failed.");
  }
  return true;
} // export

export async function query(o: Client_Options, raw_body: Expr | Record<string, any>) {
  const options = JSON.stringify(o);
  const body    = raw_inspect(raw_body);
  const cmd     = ["node", "src/Node-FaunaDB.mjs", "query", options, body ];
  const result  = await run({cmd});


  if (result.success) {
    const o = eval(`(${(result.stdout as string).replaceAll("Function(", "Fn(")})`);
    return o;
  }

  console.error("============ ");
  console.error(`Command: query`);
  console.error("=== FQL query failed:: === ");
  console.error(`Exit code: ${result.code}`);
  console.error("============ ");
  console.error(inspect(raw_body));
  console.error("============ ");
  console.error("STDOUT: ", result.stdout);
  console.error("STDERR: ", result.stderr);
  console.error("============ ");

  throw new Error("query failed.");
} // export

// # =============================================================================
// # === FQL Composition Functions ===============================================
// # =============================================================================

export function schema() {
  return Reduce(
    Lambda(
      ["acc", "coll"],
      Append(
        Select(
          "data",
          Map(
            Paginate(Var("coll")),
            Lambda("x", Get(Var("x")))
          )
        ), // Map
        Var("acc")
      ) // Prepend
    ), // Lambda
    [],
    [Roles(), Collections(), Functions(), Indexes()]
  ); // Reduce
} // export

export function concat_data(...args: Expr[]) {
  const new_args = args.map((x) => {
    return Select("data", x);
  });
  return concat_array(...new_args);
} // export function

export function drop(x: Expr) {
  return Map(
    Paginate(x),
    Lambda("x", Delete(Var("x")))
  );
} // export function

export function map_select(x: Expr, k: string) {
  return Map(
    x,
    Lambda(
      "doc",
      Select(k, Var("doc"))
    ) // Lambda
  );
} // export function

export function concat_array(...args: Expr[]) {
  return args.reverse().reduce((old, curr) => {
    if (!old) { return curr; }
    return Prepend(old, curr);
  });
} // export function

export function drop_schema() {
  return Do(
    drop(Collections()),
    drop(Roles()),
    drop(Indexes()),
    drop(Functions())
  );
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

export function Select_Map_Paginate(x: Expr) {
  return Select(
    "data",
    Map(
      Paginate(x),
      Lambda("x", Get(Var("x")))
    )
  );
} // func

// # =============================================================================
// # === Migration Functions =====================================================
// # =============================================================================

export function standardize(raw_x: any) {
  return JSON.parse(JSON.stringify(raw_x));
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

export function create_doc(doc: New_Spec): Expr {
  for (const [k,new_values] of Object.entries(doc)) {
    switch (k) {
      case "Index": {
        return CreateIndex(new_values as New_Index);
      }
      case "Role": {
        return CreateRole(new_values as New_Role);
      }
      case "Collection": {
        return CreateCollection(new_values as New_Collection);
      }
      case "Fn": {
        return CreateFunction(new_values as New_Fn);
      }
    } // switch
  } // for
  throw new Error(`Invalid object: ${Deno.inspect(doc)}`);
} // export function

export function new_ref(d: New_Spec) {
  for (const [coll,doc] of Object.entries(d)) {
    switch (coll) {
      case "Index": { return Index(doc.name); }
      case "Role": { return Role(doc.name); }
      case "Collection": { return Collection(doc.name); }
      case "Fn": { return Fn(doc.name); }
    } // switch
  } // for
  throw new Error(`Invalid object: ${Deno.inspect(d)}`);
} // export function

export function spec_entry(dspec: New_Spec): [Schema_Ref_Collection, New_Doc] {
  for (const [coll,doc] of Object.entries(dspec)) {
    switch (coll) {
      case "Index":
      case "Role":
      case "Collection":
      case "Fn": {
        return [coll, doc];
      }
    } // switch
  } // for
  throw new Error(`Invalid object: ${Deno.inspect(dspec)}`);
} // export function

export function ref_compare(x: Schema_Doc, y: New_Spec) {
  return deepEqual(x.ref, new_ref(y));
} // export function

export function doc_compare(old_doc: Schema_Doc, new_spec: New_Spec): boolean | Expr {
  if (!ref_compare(old_doc, new_spec))
    return false;
  const [new_coll, new_doc] = spec_entry(new_spec);
  const merged = Object.assign({}, old_doc, new_doc);

  if (deepEqual(merged, old_doc))
    return true;

  return Update(
    old_doc.ref,
    Object.assign({}, new_doc)
  );
} // export function

export function diff(f_old: Schema, f_new: New_Schema) {
  const fin: Expr[] = [];

  for (let i = 0; i < f_new.length; i++) {
    const new_doc = f_new[i];
    let do_create = true;

    for (let j = 0; j < f_old.length; j++) inner: {
      const old_doc = f_old[j];
      const c = doc_compare(old_doc, new_doc);
      switch (c) {
        case true: { // Docs match.
          do_create = false;
          break inner;
        }
        case false: { // No match.
          break;
        }
        default: {
          fin.push(c as Expr);
          do_create = false;
          break inner;
        }
      } // switch
    } // for

    if (do_create)
      fin.push(create_doc(new_doc));
  } // for

  for (const old_doc of f_old) {
    const new_doc = f_new.find(
      (n: New_Spec) => ref_compare(old_doc, n)
    );

    if (!new_doc) {
      fin.push(Delete(old_doc.ref));
    } // if
  } // for

  return fin;
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
