
import util from "util";
import {default as F} from "faunadb";

// start macro: import-node
const {
Add,
Call,
Ceil,
Collection,
Collections,
Concat,
ContainsField, ContainsPath, ContainsStr, ContainsStrRegex, ContainsValue,
Count,
Create,
CreateCollection, CreateFunction, CreateIndex, CreateRole,
CurrentIdentity,
Delete,
Difference,
Distinct,
Divide,
Do,
Documents,
Drop,
EndsWith,
Epoch,
Exists,
Functions,
Function: Fn,
Database,
Get,
GT, GTE,
Identify,
If,
Index,
Indexes,
Insert,
Intersection,
IsArray, IsBoolean, IsEmpty, IsNonEmpty, IsNull, IsNumber, IsSet, IsString, IsTimestamp, IsToken,
Join,
LT, LTE, LTrim,
Lambda,
Length,
Let,
Ln,
LowerCase,
Map, Match, Max, Mean, Merge, Min, Minute, Modulo, Month, Multiply,
Not, Now,
Or,
Paginate, Prepend,
Query,
RTrim, Range, Reduce, RegexEscape, Role, Ref, Roles, Remove, Repeat,
Replace, ReplaceStr, ReplaceStrRegex,
Reverse, Round,
Select,
Space,
StartsWith,
SubString,
Subtract,
Sum,
Take,
Time, TimeAdd, TimeDiff, TimeSubstract,
TitleCase,
ToArray, ToDate, ToDouble, ToInteger, ToString, ToTime,
Trim,
Trunc,
Union,
Update,
UpperCase,
Var,
} = F.query;
// end macro

function inspect(x) {
  return util.inspect(x, {depth: Infinity});
} // function


    // this.__new_schema = {
    //   "functions":   {},
    //   "indexes":     {},
    //   "collections": {},
    //   "roles":       {}
    // };
    // this.__old_schema = await this.client.query({
    //   collections: Select_Map_Paginate(Collections()),
    //   functions: Select_Map_Paginate(Functions()),
    //   indexes: Select_Map_Paginate(Indexes()),
    //   roles: Select_Map_Paginate(Roles())
    // });

  // __CREATE_RESOURCE(resource_type, param_object) {
  //   const data = param_object.data || {};
  //   if (!data.hash_version) {
  //     data.hash_version = btoa(JSON.stringify(param_object));
  //   }
  //   param_object.data = data;
  //   this.new_schema[resource_type][param_object.name] = param_object;
  //   return param_object;
  // } // method

const DEFAULT_OPTIONS = {
  secret:    "UNKNOWN",
  port:      443,
  scheme:    "https",
  keepAlive: false,
  timeout:   5,
  domain:    "db.us.fauna.com"
};

async function main() {
  let v = null;
  // const SECRET_KEY = process.env.FAUNADB_SECRET_KEY;
  const options = JSON.parse(process.argv[2]);
  const body = process.argv[3];

  v = eval(`(${body})`);

  const fin_o = Object.assign({}, DEFAULT_OPTIONS, options);
  if (fin_o.secret === "UNKNOWN") {
    throw new Error("A secret key has not been set.");
  }
  const CLIENT = new F.Client(fin_o);
  const results = await CLIENT.query(v);
  console.log(JSON.stringify(results));

  return results;
} // function main

await main();
