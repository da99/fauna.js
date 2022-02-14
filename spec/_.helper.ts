
import {deepEqual} from "https://deno.land/x/cotton@v0.7.3/src/utils/deepequal.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

export function daEquals(x: any, y: any) {
  if (deepEqual(x, y))
    return true;
  return assertEquals(x,y);
} // export function
