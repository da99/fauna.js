#!/usr/bin/env -S deno run --allow-run=fd,find --allow-net=storage.bunnycdn.com --allow-env=BUNNY_URL,BUNNY_KEY --allow-read=./ --allow-write=./

// import * as path from "https://deno.land/std/path/mod.ts";
import {meta_url, match, values, not_found} from "../src/CLI.ts";
import {fd} from "../src/Shell.ts";
import {
  UP_CASE,
  remove_pattern,
  begin_dot_slash,
  path_to_filename,
  env_or_throw
} from "../src/Function.ts";

meta_url(import.meta.url);

export const FILE_TS = ".FILES.ts";
export interface Bunny_Response {
  HttpCode: 200 | 201 | 400 | 404;
  Message: "Object Not Found";
}
export interface Bunny_File {
  "Guid":            string;
  "StorageZoneName": string;
  "Path":            string;
  "ObjectName":      string;
  "Length":          number;
  "LastChanged":     string;
  "IsDirectory":     boolean;
  "ServerId":        number;
  "UserId":          string;
  "DateCreated":     string;
  "StorageZoneId":   number
};

function ensure_valid_dir() {
  try {
    Deno.readFileSync(FILE_TS)
  } catch (e) {
    console.error(`File not found: ${Deno.cwd()}/${FILE_TS}`);
    Deno.exit(1);
  }
  return true;
} // function

if (match("ls files", "Be sure to 'cd' into the Public directory you want to upload.")) {
  (await fd(`--max-depth 4 --type f --size -15m --exec sha256sum {} ;`))
  .cut('  ')
  .map_column(0, UP_CASE)
  .map_column(1, remove_pattern(begin_dot_slash))
  .arrange(1,0,1)
  .map_column(2, path_to_filename('.'))
  .raw
  .map((r: string[]) => `${r[0]} ${r[1]}.${r[2]}`)
  .sort()
  .forEach(x => console.log(x));
} // if

if (match(`ls remote files <dirname>`)) {
  const [dirname] = values();
  const url = `${env_or_throw("BUNNY_URL")}/${dirname}/`;
  await fetch(url, {
    method: "GET",
    headers: {
      "Accept": '*/*',
      "AccessKey": env_or_throw("BUNNY_KEY")
    }
  })
  .then(resp => resp.json())
  .then((x: Bunny_Response | Bunny_File[]) => {
    if ("length" in x) {
      const files: Bunny_File[] = x;
      if (files.length === 0)
        console.error(`No files found for: ${url}`);
      for (const f of files) {
        console.log(`${f.Path} ${f.ObjectName}`);
      };
      return files;
    }
    console.error(`${url} ${Deno.inspect(x, {colors: true})}`);
  });
} // if


not_found();
