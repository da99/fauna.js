#!/usr/bin/env -S deno run --allow-run=fd,find --allow-net=storage.bunnycdn.com --allow-env=BUNNY_URL,BUNNY_KEY --allow-read=./ --allow-write=./

// import * as path from "https://deno.land/std/path/mod.ts";
import {meta_url, match, values, not_found} from "../src/CLI.ts";
import {content_type} from "../src/Function.ts";
import {fd, columns} from "../src/Shell.ts";
import { readerFromStreamReader } from "https://deno.land/std/io/mod.ts";
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

export interface Local_File {
  local_path: string;
  remote_path: string;
  size: number
};

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
  const files = await local_files();
  for (const f of files) {
    console.log(`${Math.round(f.size / 1024)}KB ${f.local_path} ${f.remote_path}`)
  } // for
} // if

if (match(`ls remote files in <remote_dirname>`)) {
  const [dirname] = values();
  const files = await remote_files(dirname as string);
  for (const f of files) {
    console.log(`${f.Path} ${f.ObjectName}`);
  };
} // if

if (match(`ls files to upload to <remote_dirname>`)) {
  const [dirname] = values() as string[];
  (await uploadable_local_files(dirname)).forEach(lf => {
    console.log(`${lf.local_path} ${lf.remote_path}`);
  })
} // if

if (match(`upload files to <remote_dirname>`)) {
  const [dirname] = values() as string[];
  const results: Promise<Response>[] = [];
  const files: Local_File[] = [];
  for (const lf of (await uploadable_local_files(dirname))) {
    const url = bunny_url(dirname);
    const f = fetch(url, {
      method: "PUT",
      headers: {
        "Accept": '*/*',
        "AccessKey": env_or_throw("BUNNY_KEY"),
        "Content-Type": content_type(lf.local_path),
        "Content-Length": (await Deno.stat(lf.local_path)).size.toString(),
      }
    }); // fetch
    files.push(lf);
    results.push(f);
  } // for
  const responses = (await Promise.all(results));
  columns(files).push_columns("right",columns(responses));
} // if

not_found();

function bunny_url(dirname: string) {
  return `${env_or_throw("BUNNY_URL")}/${dirname}/`;;
} // function

export async function local_files(): Promise<Local_File[]> {
  const local_sha_filename = (await fd(`--max-depth 4 --type f --size -15m --exec sha256sum {} ;`))
  .split('  ')
  .column(0, UP_CASE)
  .column(1, remove_pattern(begin_dot_slash))
  .arrange(1,0,1)
  .column('last', path_to_filename('.'));

  const stat = await Promise.all(
    local_sha_filename.column("first")
    .raw
    .map(r => Deno.stat(r[0]))
  );

  return local_sha_filename.push_columns("right", columns(stat)).
    raw.map(row => ({
    local_path: row[0],
    remote_path: `${row[1]}.${row[2]}`,
    size: row[3].size
  })).sort();
} // export async function

export function remote_files(dirname: string): Promise<Bunny_File[]> {
  const url = `${env_or_throw("BUNNY_URL")}/${dirname}/`;
  return fetch(url, {
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
      return files;
    }
    throw new Error(`${url} ${Deno.inspect(x, {colors: true})}`);
  });
} // export async

export async function uploadable_local_files(dirname: string): Promise<Local_File[]> {
  const remote    = await remote_files(dirname);
  const local     = await local_files();
  const remote_paths = remote.map(bf => bf.ObjectName);
  return local.filter(lf => !remote_paths.includes(lf.remote_path));
} // export async
