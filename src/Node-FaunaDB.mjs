
import util from "util";
import {default as F} from "faunadb";

// start macro: import-node
const {
  Add, Append,
  Call, Ceil, Collection, Collections, Concat,
  ContainsField, ContainsPath, ContainsStr, ContainsStrRegex, ContainsValue,
  Count, Create,
  CreateCollection, CreateFunction, CreateIndex, CreateRole,
  CurrentIdentity,
  Delete, Difference, Distinct, Divide, Do, Documents, Drop,
  Database,
  EndsWith, Epoch, Exists, Equals,
  Filter, Functions, Function: Fn, Foreach,
  Get, GT, GTE, Identify,
  If, Index, Indexes, Insert, Intersection,
  IsArray, IsBoolean, IsEmpty, IsNonEmpty, IsNull, IsNumber, IsSet, IsString, IsTimestamp, IsToken, IsRole,
  IsCollection, IsFunction, IsIndex,
  Join,
  LT, LTE, LTrim,
  Lambda, Length, Let, Ln, LowerCase,
  Map, Match, Max, Mean, Merge, Min, Minute, Modulo, Month, Multiply,
  Not, Now,
  Or,
  Paginate, Prepend,
  Query,
  RTrim, Range, Reduce, RegexEscape, Role, Ref, Roles, Remove, Repeat,
  Replace, ReplaceStr, ReplaceStrRegex, Reverse, Round, Select,
  Space, StartsWith, SubString, Subtract, Sum,
  Take, Time, TimeAdd, TimeDiff, TimeSubstract, TitleCase,
  ToObject, ToArray, ToDate, ToDouble, ToInteger, ToString, ToTime,
  Trim, Trunc,
  Union, Update, UpperCase,
  Var,
} = F.query;
// end macro

function CleanFn(x) {
  return x.replaceAll('Function(', 'Fn(');
}

function inspect(x) {
  return util.inspect(x, {depth: Infinity});
} // function

function inspect_fql(x) {
  return CleanFn(util.inspect(x, {depth: Infinity}));
} // function


const DEFAULT_OPTIONS = {
  secret:    process.env.FAUNA_KEY || "UNKNOWN",
  port:      443,
  scheme:    "https",
  keepAlive: false,
  timeout:   6,
  domain:    process.env.FAUNA_DOMAIN || "db.us.fauna.com"
};

async function query(raw_body) {
    let v = null;
    v = eval(`(${raw_body})`);
    const fin_o = Object.assign({}, DEFAULT_OPTIONS);
    if (fin_o.secret === "UNKNOWN") {
      throw new Error("A secret key has not been set.");
    }
    const CLIENT = new F.Client(fin_o);
    const results = await CLIENT.query(v);
    console.log(inspect_fql(results));
} // function main

async function schema(body) {
    let v = null;

    const fin_o = Object.assign({}, DEFAULT_OPTIONS);
    if (fin_o.secret === "UNKNOWN") {
      throw new Error("A secret key has not been set.");
    }
    const CLIENT = new F.Client(fin_o);
    const results = await CLIENT.query(
      Reduce(
        Lambda(
          ["acc", "coll"],
          Append(
            Select("data", Map(
              Paginate(Var("coll")),
              Lambda("x", Get(Var("x")))
            )), // Map
            Var("acc")
          ) // Prepend
        ), // Lambda
        [],
        [Roles(), Collections(), Functions(), Indexes()]
      ) // Reduce
    );
    console.log(inspect_fql(results));
} // async function

const cmd = process.argv[2];
const args = process.argv.slice(3);

switch (cmd) {
  case "echo": {
    console.log(
      eval(
        `(${CleanFn(args[0])})`
      )
    );
    break;
  }
  case "query": {
    query(...args);
    break;
  }

  case "schema": {
    schema(...args);
    break;
  }

  default: {
    console.error(`!!! Unknown arguments: ${cmd} ${inspect(args)}`);
    process.exit(2);
  }
} // switch
