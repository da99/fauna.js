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
  equals(a.map(x => x.raw_filename), ["a.txt", "b.txt"]);
});

it("ignores hidden files", async () => {
  const files = await setup();
  const a = await current_files("tmp/spec/check");
  equals(
    a.map(x => x.raw_filename),
    files.map(x => path.basename(x)).filter(x => x.indexOf('.') !== 0)
  );
});

it("returns the content type of the file.", async () => {
  const files = await setup();
  const actual = await current_files("tmp/spec/check");

  const expect = [
    "text/plain; charset=utf-8",
    "text/plain; charset=utf-8",
  ];
  equals(actual.map(x => x.content_type), expect)
});

describe("File_Manifest current_files_object");

it("returns a Record with the specified key", async () => {
  const files = await setup();
  const a = await current_files_object("raw_filename", "tmp/spec/check");
  equals(Object.keys(a), ["a.txt", "b.txt"]);
  const b = await current_files_object("cdn_filename", "tmp/spec/check");

  const expect = [
    "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb.a.txt",
   "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d.b.txt",
  ];
  equals(Object.keys(b), expect)
});

