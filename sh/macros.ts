#!/usr/bin/env -S deno run --allow-write="src/FaunaDB.ts,src/Node-FaunaDB.mjs" --allow-read="src/FaunaDB.ts,src/Node-FaunaDB.mjs"

import { Text_File } from "../src/Text_File.ts";
const COMMANDS = {
 Add: null,
  Call: null, Ceil: null, Collection: null,
  Collections: null,
  Concat: null, ContainsField: null, ContainsPath: null, ContainsStr: null,
  ContainsStrRegex: null, ContainsValue: null,
  Count: null, Create: null, CreateCollection: null,
  CreateFunction: null, CreateIndex: null, CreateRole: null,
  CurrentIdentity: null, Delete: null, Difference: null, Distinct: null, Divide: null,
  Do: null, Documents: null, Drop: null, EndsWith: null, Epoch: null,
  Functions: null,
  Function: "Fn",
  Database: null,
  Get: null, GT: null, GTE: null,
  Identify: null, If: null, Index: null, Indexes: null, Insert: null, Intersection: null,
  IsArray: null, IsBoolean: null, IsEmpty: null, IsNonEmpty: null, IsNull: null, IsNumber: null, IsSet: null,
  IsString: null, IsTimestamp: null, IsToken: null, Join: null,
  LT: null, LTE: null, LTrim: null, Lambda: null, Length: null, Let: null, Ln: null, LowerCase: null,
  Map: null, Match: null, Max: null, Mean: null, Merge: null, Min: null, Minute: null, Modulo: null, Month: null, Multiply: null,
  Not: null, Now: null, Or: null,
  Paginate: null, Prepend: null,
  Query: null,
  RTrim: null, Range: null, Reduce: null, RegexEscape: null, Role: null, Ref: null, Roles: null,
  Remove: null, Repeat: null, Replace: null, ReplaceStr: null, ReplaceStrRegex: null,
  Reverse: null, Round: null,
  Select: null, Space: null, StartsWith: null, SubString: null, Subtract: null, Sum: null,
  Take: null, Time: null, TimeAdd: null, TimeDiff: null, TimeSubstract: null, TitleCase: null, ToArray: null,
  ToDate: null, ToDouble: null, ToInteger: null, ToString: null, ToTime: null, Trim: null, Trunc: null,
  Union: null, Update: null, UpperCase: null,
  Var: null,
};


// get file and directory name
const __filename = import.meta.url.replace("file://", "");
const __dirname = __filename.split("/").slice(0, -1).join("/");

const cmd = Deno.args[0];

function get_macro(name: string, txt: string) {
  const reg = new RegExp(`// start macro:\\s+${name}\n(.+)//\\s+end\\s+macro`, "mis");
  return txt.match(reg);
} // function

function update_CreateExpr() {
  let f = new Text_File("src/FaunaDB.ts");
  const macro_name = "CreateExpr";
  console.error(`=== for ${f.filename}`);
  let values = [];
  for (const [fname, jsname] of Object.entries(COMMANDS)) {
    values.push(`export const ${jsname || fname} = CreateExpr("${fname}");`);
  } // for
  values.push(""); // for newline right before closing macro (ie // end macro);

  let txt = f.text || "";
  const match = get_macro(macro_name, txt);
  const m = match && match[1];
  if (m) {
    const new_string = values.join("\n");
    if (m === new_string) {
      console.log(`=== Already updated: ${macro_name} ${f.filename}`);
    } else {
      f.write(txt.replace(m, new_string));
      console.log(`=== Wrote: ${macro_name} ${f.filename}`);
    }
  } else {
    console.error(`!!! No macro found for: ${macro_name} in ${f.filename}`);
    Deno.exit(1);
  }
} // function

function update_import_node() {
    const f          = new Text_File("src/Node-FaunaDB.mjs");
    const old_body   = f.text;
    const values     = [];
    const macro_name = "import-node";
    console.error(`=== for ${f.filename}`);
    values.push("const {");
    for (const [fname, jsname] of Object.entries(COMMANDS)) {
      if (jsname) {
        values.push(`${fname}: ${jsname},`);
      } else {
        values.push(`${fname},`);
      }
    }
    values.push("} = F.query;\n");

    const new_txt = values.join("\n");
    const match = get_macro(macro_name, f.text || "");
    const m = match && match[1];
    if (m) {
      if (m === new_txt) {
        console.log(`=== Already updated: ${macro_name} ${f.filename}`);
      } else if (old_body) {
        f.write(old_body.replace(m, new_txt));
        console.log(`=== Wrote: ${macro_name} ${f.filename}`);
      }
    } else {
      console.error(`!!! No macro found for: ${macro_name} in ${f.filename}`);
      Deno.exit(1);
    }
} // function

switch (cmd) {

  case "update": {
    update_CreateExpr();
    update_import_node();
  } // case
  break;
  default:
    console.error(`!!! Invalid commands: ${Deno.inspect(Deno.args)}`);
    Deno.exit(1);
} // switch
