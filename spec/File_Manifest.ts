import { describe, it, equals } from "../src/Spec.ts";
import { current_files, current_files_object } from "../src/File_Manifest.ts";

import {exists, ensureDirSync} from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

async function setup() {
  ensureDirSync("tmp/spec/check");
  const files = "a b .a".trim().split(/\s+/).map(x => `tmp/spec/check/${x}.txt`);
  try {
    await Promise.all(
      files.map(x => Deno.readTextFile(x))
    )
  } catch (e) {
    await Promise.all(
      files.map(x => Deno.writeTextFile(x, x))
    );
  }
  return files;
} // function

describe("File_Manifest current_files");

it("returns the sha256sum of each file in a directory", async () => {
  const files = await setup();
  const a = await current_files("tmp/spec/check");
  equals(a.map(x => x.raw_filename), ["tmp/spec/check/a.txt", "tmp/spec/check/b.txt"]);
});

it("ignores hidden files", async () => {
  const files = await setup();
  const a = await current_files("tmp/spec/check");
  equals(
    a.map(x => x.raw_filename),
    files.filter(x => path.basename(x).indexOf('.') !== 0)
  );
});

describe("File_Manifest current_files_object");

it("returns a Record with the specified key", async () => {
  const files = await setup();
  const a = await current_files_object("raw_filename", "tmp/spec/check");
  equals(Object.keys(a), ["tmp/spec/check/a.txt", "tmp/spec/check/b.txt"]);
  const b = await current_files_object("cdn_filename", "tmp/spec/check");

  const expect = [
    "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb.tmp_spec/check/a.txt",
   "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d.tmp_spec/check/b.txt",
  ];
  equals(Object.keys(b), expect)
});

