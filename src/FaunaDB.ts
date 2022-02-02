
import { split_whitespace } from "./String.ts";
// const {
//   Paginate,
//   Database, Collection,  Role,
//   Get, Query,
//   Function: FN,
//   Functions, Roles, Collections, Indexes,
//   Create, CreateFunction, CreateRole, CreateCollection, CreateIndex,
//   Var,
//   Ref,
//   Lambda,
//   LowerCase,
//   Select,
//   Map,
//   Delete,
//   Update
// } = F.query;

const DEFAULT_CLIENT_VALUES = {
  secret:    "",
  port:      443,
  scheme:    "https",
  keepAlive: false,
  timeout:   5
}; // const

const F: Fauna = {
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

function new_expr(name: string) {
  return (...args: any[]) : Expr => {
    return {
      name: name,
      args: args,
      [Symbol.for("Deno.customInspect")](): string {
        return `${name}(${args.map((x: any) => Deno.inspect(x)).join(', ')})`;
      }
    };
  };
} // function


const Paginate       = new_expr("Paginate");
const Collections    = new_expr("Collections");
const Get            = new_expr("Get");
const Fn             = new_expr("Function");
const Database       = new_expr("Database");
const Query          = new_expr("Query");
const Create         = new_expr("Create");
const CreateRole     = new_expr("CreateRole");
const CreateFunction = new_expr("CreateFunction");
const CreateIndex    = new_expr("CreateIndex");
const CreateCollection=new_expr("CreateCollection");
const Collection     = new_expr("Collection");
const Var            = new_expr("Var");
const LowerCase      = new_expr("LowerCase");
const Ref            = new_expr("Ref");
const Lambda         = new_expr("Lambda");
const Select         = new_expr("Select");
const Map            = new_expr("Map");
const Functions      = new_expr("Functions");
const Indexes        = new_expr("Indexes");
const Role           = new_expr("Role");
const Roles          = new_expr("Roles");
const Equals         = new_expr("Equals");

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


async function run_in_node(env: ENV, raw_body: Expr) {
  const body = Deno.inspect(raw_body);
  const proc = Deno.run({
    cmd: ["node", "src/Node-FaunaDB.mjs", body ],
    env: env,
    stdout: 'piped',
    stderr: 'piped'
  });

  const result = await proc.status();
  const so = new TextDecoder().decode(await proc.output());
  const se = new TextDecoder().decode(await proc.stderrOutput());

  if (result.success) {
    return JSON.parse(so);
  } else {
    console.log(se);
    Deno.exit(result.code);
  }
} // function

function Select_Map_Paginate(x: Expr) {
  return Select(
    "data",
    Map(
      Paginate(x),
      Lambda("x", Get(Var("x")))
    )
  );
} // func


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

export {
  run_in_node,
  F,
  Select_Map_Paginate,
  Paginate,
  Collections,
  Get,
  Fn as Function,
  Database,
  Query,
  Create,
  CreateFunction,
  Collection,
  Var,
  LowerCase,
  Ref,
  Lambda,
  Select,
  Map,
  Functions,
  Indexes,
  Role,
  CreateRole,
  Roles,
  Equals
};
