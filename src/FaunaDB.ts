
import { split_whitespace } from "./String.ts";
import { run } from "./Process.ts";
import { inspect, raw_inspect } from "./CLI.ts";
import {deepEqual} from "https://deno.land/x/cotton@v0.7.3/src/utils/deepequal.ts";

type schema_category = "role" | "collection" | "index" | "function";

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
  readonly is_expr: true;
  // [Deno.customInspect](): string;
} // class

type Common_Doc_Value = number | string | null | boolean | any[];
export type FQL_Doc = Record<string, Expr | Common_Doc_Value>;
export type Schema          = Array<FQL_Doc>;
export type Standard_Doc    = Record<string, Record<string, Common_Doc_Value> | Common_Doc_Value>;
export type Standard_Schema = Array<Standard_Doc>;


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

export function remove_key(key: string, x: Standard_Doc) : Standard_Doc {
    if (typeof x === "object" && x.constructor.name === "Object" && x.ref) {
      const new_x = Object.assign({}, x) as Standard_Doc;
      delete new_x[key];
      return new_x;
    } // if

    return x;
} // export function

export function find_doc_in_schema(doc: FQL_Doc, schema: Schema) {
  return schema.find((d) => {
    return d.ref && doc.ref && deepEqual(d.ref, doc.ref);
  });
} // export function
export function docs_equal(old_doc: FQL_Doc, new_doc: FQL_Doc) {
  const fql_compare = Object.assign({}, old_doc, new_doc);
  return deepEqual(standardize(fql_compare), standardize(old_doc));
} // export function

export function standardize(raw_x: any) {
  return JSON.parse(JSON.stringify(raw_x));
  // return(
  //   x.map((o: Standard_Doc) => {
  //     return remove_key(
  //       "gql",
  //       remove_key("ts", o)
  //     )
  //   })
  // );
} // export function

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
export const Equals = CreateExpr("Equals");
export const Filter = CreateExpr("Filter");
export const Functions = CreateExpr("Functions");
export const Fn = CreateExpr("Fn");
export const Foreach = CreateExpr("Foreach");
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
export const IsCollection = CreateExpr("IsCollection");
export const IsEmpty = CreateExpr("IsEmpty");
export const IsFunction = CreateExpr("IsFunction");
export const IsIndex = CreateExpr("IsIndex");
export const IsNonEmpty = CreateExpr("IsNonEmpty");
export const IsNull = CreateExpr("IsNull");
export const IsNumber = CreateExpr("IsNumber");
export const IsSet = CreateExpr("IsSet");
export const IsString = CreateExpr("IsString");
export const IsRef = CreateExpr("IsRef");
export const IsRole = CreateExpr("IsRole");
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
export const ToObject = CreateExpr("ToObject");
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


function same_version(old_o: Param_Object, new_o: Param_Object) {
  const old_hash_version = (old_o.data || {}).hash_version;
  return old_hash_version === (new_o.data as Param_Object_Data).hash_version;
} // function

function find_name(arr: Array<Param_Object>, name_value: string) {
  return arr.find(x => x.name === name_value);
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

  throw new Error("failed.");
} // export

export function drop(x: Expr) {
  return Map(
    Paginate(x),
    Lambda("x", Delete(Var("x")))
  );
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

export function export_collection(coll: Expr, keys: string[]) {
  return Map(
    Paginate(coll),
    Lambda(
      "r",
      {
        coll,
        doc: select_keys(keys, Get(Var("r")))
      }
    ) // Lambda
  );
} // export function

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
  // return concat_data(
  //   export_collection(Roles(), ["ref", "name", "privileges", "data?"]),
  //   export_collection(Collections(), ["ref", "history_days", "name", "data?"]),
  //   export_collection(Indexes(), ["ref", "serialized", "name", "unique", "source", "terms", "values?", "data?"]),
  //   export_collection(Functions(), ["ref", "name", "body", "role?", "data?"])
  // );
} // export

export function map_select(x: Expr, k: string) {
  return Map(
    x,
    Lambda(
      "doc",
      Select(k, Var("doc"))
    ) // Lambda
  );
} // export function

export function array_to_object(k: string, x: Expr) {
  return ToObject(
    Map(
      x,
      Lambda(
        "doc",
        [Select("name", Var("doc")), Var("doc")]
      )
    )
  );
} // export function

export function diff_filter_a_not_in_b(key: string, raw_a: Expr, raw_b: Expr) {
  return Let(
    {
      a: Select(key, raw_a),
      b: Select(key, raw_b),
      a_names: map_select(Var("a"), "name"),
      b_names: map_select(Var("b"), "name"),
      a_o: array_to_object("name", Var("a")),
      b_o: array_to_object("name", Var("b")),
      create_or_update: Map(
        Var("a"),
        Lambda(
          "doc",
          If(
            ContainsValue(Select("name", Var("doc")), Var("b_names")),
            If(
              ContainsValue(Var("doc"), Var("b")),
              ["update", key, Var("doc")],
              null
            ), // If/update
          ["create", key, Var("doc")]
          )
        )
      ), // Map
      delete: Map(
        Var("b"),
        Lambda(
          "doc",
          If(
            Not(ContainsValue(Select("name", Var("doc")), Var("a_names"))),
            ["delete", key, Select("ref", Var("doc"))],
            null
          )
        )
      ), // Map
    },
    Append(Var("delete"), Var("create_or_update"))
  );
} // export function

export function concat_array(...args: Expr[]) {
  return args.reverse().reduce((old, curr) => {
    if (!old) { return curr; }
    return Prepend(old, curr);
  });
} // export function

export function concat_data(...args: Expr[]) {
  const new_args = args.map((x) => {
    return Select("data", x);
  });
  return concat_array(...new_args);
} // export function

// export function create_new_doc(doc: FQL_Doc) {
//   const ref = doc.ref as Expr;
//   const coll_name = ref.name;
//   switch (coll_name) {
//     case "Index": {
//       const new_values = {}
//       CreateIndex(
//       );
//       break;
//     }
//     default: {
//     }
//   } // swotcj
// } // export function

export function diff(f_old: Schema, f_new: Schema) {
  const fin: Expr[] = [];
  const s_old = standardize(f_old);
  const s_new = standardize(f_new);
  for (let i = 0; i < s_new.length; i++) {
    const new_s = s_new[i];
    const new_f = f_new[i];
    const old_s = s_old.find(o => deepEqual(o.ref, new_s.ref));

    if (!old_s) {
      fin.push(create_new_doc(new_f));
    }
    if (old_s && !deepEqual(old_s, new_s)) {
      fin.push(update_new_doc(new_f));
    }
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

