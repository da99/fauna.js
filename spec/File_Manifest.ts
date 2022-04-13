import { describe, it, equals } from "../src/Spec.ts";
import { current_files, current_files_object } from "../src/File_Manifest.ts";

import {exists, ensureDirSync} from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const DIR = "tmp/spec/check";
const DEEP = `${DIR}/1/2/3`;

function visible(x: string[]) {
  return x.filter(x => path.basename(x).indexOf('.') !== 0 );
} // function

async function setup() {
  ensureDirSync(DEEP);
  const files = "a b .a".trim().split(/\s+/).map(x => `${DEEP}/${x}.txt`);
  try {
    await Promise.all(
      files.map(x => Deno.readTextFile(x))
    )
  } catch (e) {
    await Promise.all(
      files.map(x => Deno.writeTextFile(x, (new Date()).toString()))
    );
  }
  return files.map(x => x.replace(`${DIR}/`, ''));
} // function

describe("File_Manifest current_files");

it("returns the sha256sum of each file in a directory", async () => {
  const files = await setup();
  const a = await current_files(DIR);
  equals(
    a.map(x => typeof x.sha256),
    ["string", "string"]
  );
});

it("replaces slashes in the file name with '.'", async () => {
  const files = await setup();
  const a = await current_files(DIR);
  equals(
    a.map(x => x.cdn_filename.replace(/^[a-z0-9]+\./, '')),
    visible(files).map(x => x.replace(/\//g, '_'))
  );
});

it("ignores hidden files", async () => {
  const files = await setup();
  const a = await current_files(DIR);
  equals(
    a.map(x => x.raw_filename),
    files.filter(x => path.basename(x).indexOf('.') !== 0).map(x => x.replace(`${DIR}/`, ''))
  );
});

it("returns the content type of the file.", async () => {
  const files = await setup();
  const actual = await current_files(DIR);

  const expect = [
    "text/plain; charset=utf-8",
    "text/plain; charset=utf-8",
  ];
  equals(actual.map(x => x.content_type), expect)
});

it("returns the file size for each file.", async () => {
  const files = await setup();
  const actual = await current_files(DIR);

  const expect = (new Date()).toString().length
  equals(actual.map(x => x.size), [expect, expect])
});

describe("File_Manifest current_files_object");

it("returns a Record with the specified key", async () => {
  const files = await setup();
  const a = await current_files_object("raw_filename", DIR);
  equals(Object.keys(a), visible(files));
  const b = await current_files_object("cdn_filename", DIR);

  const expect = `ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb.${files[0]}`.length;
  equals(Object.keys(b).map(x => x.length), [expect, expect])
});

