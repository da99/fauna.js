
import {existsSync} from "https://deno.land/std/fs/mod.ts";

/*
 * Text_File: The file does not have to exist.
 */
class Text_File {
  __filename: string;
  __contents: string | null;

  constructor(x: string) {
    this.__filename = x;
    this.__contents = null;
  } // constructor

  get not_empty() {
    return (this.text || "").trim().length > 0;
  } // get

  get filename() {
    return this.__filename;
  } // get

  get text() {
    if (!this.__contents) {
      try {
        this.__contents = Deno.readTextFileSync(this.filename);
      } catch(e) {
        // ignored
      }
    }

    if ((this.__contents || "").trim().length === 0) {
      return null;
    }
    return this.__contents;
  } // get

  write(s: string) {
    Deno.writeTextFileSync(this.filename, s);
    this.__contents = null;
    return this;
  } // method

  delete() {
    try {
      Deno.removeSync(this.filename);
    } catch (e) {
      // ignored for now.
    }

    return this;
  } // method

} // class


export { Text_File };
