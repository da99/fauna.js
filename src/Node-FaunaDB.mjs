
import util from "util";
import {default as F} from "faunadb";

const {
Add, Call, Ceil, Collection, Collections, Concat, ContainsField, ContainsPath, ContainsStr, ContainsStrRegex, ContainsValue, Count, Create, CreateCollection, CreateFunction, CreateIndex, CreateRole, CurrentIdentity, Delete, Difference, Distinct, Divide, Do, Documents, Drop, EndsWith, Epoch, Functions, Function: Fn, Database, Get, GT, GTE, Identify, If, Index, Indexes, Insert, Intersection, IsArray, IsBoolean, IsEmpty, IsNonEmpty, IsNull, IsNumber, IsSet, IsString, IsTimestamp, IsToken, Join, LT, LTE, LTrim, Lambda, Length, Let, Ln, LowerCase, Map, Match, Max, Mean, Merge, Min, Minute, Modulo, Month, Multiply, Not, Now, Or, Paginate, Prepend, Query, RTrim, Range, Reduce, RegexEscape, Role, Ref, Roles, Remove, Repeat, Replace, ReplaceStr, ReplaceStrRegex, Reverse, Round, Select, Space, StartsWith, SubString, Subtract, Sum, Take, Time, TimeAdd, TimeDiff, TimeSubstract, TitleCase, ToArray, ToDate, ToDouble, ToInteger, ToString, ToTime, Trim, Trunc, Union, Update, UpperCase, Var
} = F.query;


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


let v = null;
const SECRET_KEY = process.env.FAUNADB_SECRET_KEY;
const body = process.argv[2];
try {
  v = eval(`(${body})`);

  const CLIENT = new F.Client({
    secret:    process.env.FAUNA_SECRET,
    port:      443,
    scheme:    "https",
    keepAlive: false,
    timeout:   5,
    domain:    "db.us.fauna.com"
  });

  const results = await CLIENT.query(v);
  console.log(JSON.stringify(results));

} catch(e) {
  console.error(JSON.stringify({
    "you wrote": v,
    "as_string": v.toString(),
    "inspection": inspect(v)
  }));
  console.error(e);
  process.exit(1);
}
