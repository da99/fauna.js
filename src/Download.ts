
import { readerFromStreamReader } from "https://deno.land/std/io/mod.ts";

export async function download(url: string, file: string) {
  const resp = await fetch(url);
  const rdr = resp.body?.getReader();
  if (!rdr) {
    throw new Error(`Unable to get a response from ${url}`);
  } // if
  try {
    const stat = await Deno.stat(file);
    throw new Error(`Already exists: ${file}`);
  } catch (e) {
      const r = readerFromStreamReader(rdr);
      let f = null;
      try {
        f = await Deno.open(file, {create: true, write: true});
        await Deno.copy(r, f);
      } catch (e) {
        if (f)
          f.close();
        throw e;
      }
      if (f)
        f.close();
  }
  return true;
} // export async function
