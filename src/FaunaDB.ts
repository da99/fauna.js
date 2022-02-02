
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

function CreateExpr(name: string) {
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


// macro CreateExpr
const Add = CreateExpr("Add");
const Call = CreateExpr("Call");
const Ceil = CreateExpr("Ceil");
const Collection = CreateExpr("Collection");
const Collections = CreateExpr("Collections");
const Concat = CreateExpr("Concat");
const ContainsField = CreateExpr("ContainsField");
const ContainsPath = CreateExpr("ContainsPath");
const ContainsStr = CreateExpr("ContainsStr");
const ContainsStrRegex = CreateExpr("ContainsStrRegex");
const ContainsValue = CreateExpr("ContainsValue");
const Count = CreateExpr("Count");
const Create = CreateExpr("Create");
const CreateCollection = CreateExpr("CreateCollection");
const CreateFunction = CreateExpr("CreateFunction");
const CreateIndex = CreateExpr("CreateIndex");
const CreateRole = CreateExpr("CreateRole");
const CurrentIdentity = CreateExpr("CurrentIdentity");
const Delete = CreateExpr("Delete");
const Difference = CreateExpr("Difference");
const Distinct = CreateExpr("Distinct");
const Divide = CreateExpr("Divide");
const Do = CreateExpr("Do");
const Documents = CreateExpr("Documents");
const Drop = CreateExpr("Drop");
const EndsWith = CreateExpr("EndsWith");
const Epoch = CreateExpr("Epoch");
const Functions = CreateExpr("Functions");
const Fn = CreateExpr("Function");
const Database = CreateExpr("Database");
const Get = CreateExpr("Get");
const GT = CreateExpr("GT");
const GTE = CreateExpr("GTE");
const Identify = CreateExpr("Identify");
const If = CreateExpr("If");
const Index = CreateExpr("Index");
const Indexes = CreateExpr("Indexes");
const Insert = CreateExpr("Insert");
const Intersection = CreateExpr("Intersection");
const IsArray = CreateExpr("IsArray");
const IsBoolean = CreateExpr("IsBoolean");
const IsEmpty = CreateExpr("IsEmpty");
const IsNonEmpty = CreateExpr("IsNonEmpty");
const IsNull = CreateExpr("IsNull");
const IsNumber = CreateExpr("IsNumber");
const IsSet = CreateExpr("IsSet");
const IsString = CreateExpr("IsString");
const IsTimestamp = CreateExpr("IsTimestamp");
const IsToken = CreateExpr("IsToken");
const Join = CreateExpr("Join");
const LT = CreateExpr("LT");
const LTE = CreateExpr("LTE");
const LTrim = CreateExpr("LTrim");
const Lambda = CreateExpr("Lambda");
const Length = CreateExpr("Length");
const Let = CreateExpr("Let");
const Ln = CreateExpr("Ln");
const LowerCase = CreateExpr("LowerCase");
const Map = CreateExpr("Map");
const Match = CreateExpr("Match");
const Max = CreateExpr("Max");
const Mean = CreateExpr("Mean");
const Merge = CreateExpr("Merge");
const Min = CreateExpr("Min");
const Minute = CreateExpr("Minute");
const Modulo = CreateExpr("Modulo");
const Month = CreateExpr("Month");
const Multiply = CreateExpr("Multiply");
const Not = CreateExpr("Not");
const Now = CreateExpr("Now");
const Or = CreateExpr("Or");
const Paginate = CreateExpr("Paginate");
const Prepend = CreateExpr("Prepend");
const Query = CreateExpr("Query");
const RTrim = CreateExpr("RTrim");
const Range = CreateExpr("Range");
const Reduce = CreateExpr("Reduce");
const RegexEscape = CreateExpr("RegexEscape");
const Role = CreateExpr("Role");
const Ref = CreateExpr("Ref");
const Roles = CreateExpr("Roles");
const Remove = CreateExpr("Remove");
const Repeat = CreateExpr("Repeat");
const Replace = CreateExpr("Replace");
const ReplaceStr = CreateExpr("ReplaceStr");
const ReplaceStrRegex = CreateExpr("ReplaceStrRegex");
const Reverse = CreateExpr("Reverse");
const Round = CreateExpr("Round");
const Select = CreateExpr("Select");
const Space = CreateExpr("Space");
const StartsWith = CreateExpr("StartsWith");
const SubString = CreateExpr("SubString");
const Subtract = CreateExpr("Subtract");
const Sum = CreateExpr("Sum");
const Take = CreateExpr("Take");
const Time = CreateExpr("Time");
const TimeAdd = CreateExpr("TimeAdd");
const TimeDiff = CreateExpr("TimeDiff");
const TimeSubstract = CreateExpr("TimeSubstract");
const TitleCase = CreateExpr("TitleCase");
const ToArray = CreateExpr("ToArray");
const ToDate = CreateExpr("ToDate");
const ToDouble = CreateExpr("ToDouble");
const ToInteger = CreateExpr("ToInteger");
const ToString = CreateExpr("ToString");
const ToTime = CreateExpr("ToTime");
const Trim = CreateExpr("Trim");
const Trunc = CreateExpr("Trunc");
const Union = CreateExpr("Union");
const Update = CreateExpr("Update");
const UpperCase = CreateExpr("UpperCase");
const Var = CreateExpr("Var");


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

async function run_in_node(env: ENV, raw_body: any) {
  const body = Deno.inspect(raw_body);
  const proc = Deno.run({
    cmd: ["node", "src/Node-FaunaDB.mjs", body ],
    env: env,
    stdout: 'piped'
  });

  const result = await proc.status();
  const so = new TextDecoder().decode(await proc.output());

  if (result.success) {
    return JSON.parse(so);
  } else {
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
  CreateExpr,
  Select_Map_Paginate,
  Add, Call, Ceil, Collection, Collections, Concat, ContainsField, ContainsPath, ContainsStr, ContainsStrRegex, ContainsValue, Count, Create, CreateCollection, CreateFunction, CreateIndex, CreateRole, CurrentIdentity, Delete, Difference, Distinct, Divide, Do, Documents, Drop, EndsWith, Epoch, Functions, Fn, Database, Get, GT, GTE, Identify, If, Index, Indexes, Insert, Intersection, IsArray, IsBoolean, IsEmpty, IsNonEmpty, IsNull, IsNumber, IsSet, IsString, IsTimestamp, IsToken, Join, LT, LTE, LTrim, Lambda, Length, Let, Ln, LowerCase, Map, Match, Max, Mean, Merge, Min, Minute, Modulo, Month, Multiply, Not, Now, Or, Paginate, Prepend, Query, RTrim, Range, Reduce, RegexEscape, Role, Ref, Roles, Remove, Repeat, Replace, ReplaceStr, ReplaceStrRegex, Reverse, Round, Select, Space, StartsWith, SubString, Subtract, Sum, Take, Time, TimeAdd, TimeDiff, TimeSubstract, TitleCase, ToArray, ToDate, ToDouble, ToInteger, ToString, ToTime, Trim, Trunc, Union, Update, UpperCase, Var

};
