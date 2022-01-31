

import { equal as EQUAL } from "https://deno.land/std/testing/asserts.ts";
import { bold as BOLD, blue as BLUE, green as GREEN, red as RED  } from "https://deno.land/std/fmt/colors.ts";

type It_Asyn_Function = (a: Assert) => Promise<void>;
type It_Function = (a: Assert) => void;

type Describe = {
  describe: string
} // type

type It = {
  it: string,
  pass: boolean,
  body: It_Asyn_Function,
  body_string: string,
  version: string,
  results: Array<Assert_Result>
} // type

type Assert_Result = {
  name: string,
  pass: boolean,
  values: Array<any>,
  error?: unknown
} // type

type State = Array<Describe | It>
type StateKV = {
  [key: string]: It
};

type Run_Filter = (x: It) => boolean;


function is_describe(x: Describe | It) {
  return x.hasOwnProperty("describe");
} // function

function is_it(x: Describe | It) {
  return x.hasOwnProperty("it");
} // function

function is_async_function(x: any) {
  return x && x.constructor.name === "AsyncFunction";
} // function

class Evan {
  state: State;
  current_describe: string;

  constructor(old_state?: State) {
    this.state = old_state || [];
    this.current_describe = "";
  } // constructor

  print() {
    for (const result of this.state) {
      if (result.hasOwnProperty("describe")) {
        const x = result as Describe;
        console.log("");
        console.log(`${BOLD(BLUE("Describe"))}: ${x.describe}`);
      } else if (result.hasOwnProperty("it")) {
        const x = result as It;
        if (x.pass) {
          console.log(`${GREEN("- it")}: ${x.it}`);
        } else {
          console.log(`${RED("- it")}: ${x.it}`);
          console.log(x.results);
        }
      } else {
        throw new Error(`Unknown test type: ${JSON.stringify(result)}`);
      }
    } // for
  } // method

  get state_kv(): StateKV {
    const kv: StateKV = {};
    this.forEachIt(function (x: It) {
      kv[x.version] = x;
    });
    return kv;
  } // get

  push(x: Describe | It) {
    this.state.push(x);
    return this;
  }

  describe(title: string) {
    this.current_describe = title;
    return this.state.push({describe: title});
  } // method

  it(title: string, raw_f: It_Function | It_Asyn_Function) {
    let f = raw_f;
    if (!is_async_function(raw_f)) {
      f = async (a: Assert) => { return raw_f(a); }
    }
    return this.push({
      it:          title,
      pass:        false,
      version:     `${this.current_describe} ${title}`.trim(),
      body:        f as It_Asyn_Function,
      body_string: f.toString(),
      results:     []
    });
  } // method

  forEachDescribe(f: (x: Describe) => void) {
    for (const x of this.state) {
      if (x.hasOwnProperty("describe")) {
        const d = x as Describe;
        f(d);
      }
    } // for
  } // method

  forEachIt(f: (x: It) => void) {
    for (const x of this.state) {
      if (x.hasOwnProperty("it")) {
        const it = x as It;
        f(it);
      }
    } // for
  } // method

  reject_passes(old: State) {
    const old_e = new Evan(old)
    const old_kv: StateKV = old_e.state_kv;

    return this.filter((x: Describe | It) => {
      if (x.hasOwnProperty("it")) {
        const it = x as It;
        return old_kv[it.version].pass === false;
      }
      return true;
    });
  } // methodd

  get is_empty() {
    return this.state.length === 0;
  }

  get pass() {
    return !this.state.find((x: It | Describe) => !(x as It).pass);
  } // method

  get has_fails() {
    return this.fails.length > 0;
  }

  get fails() : Array<It> {
    return this.state.filter((x: It | Describe) => !(x as It).pass) as Array<It>;
  } // method

  static it_with_version(x: string) {
    return function(it: It) {
      return it.version === x;
    };
  } // static

  filter(f: (x: Describe | It) => boolean) {
    this.state = this.state.filter(f);
    return this;
  } // methodd

  filterIt(f: (x: It) => boolean) {
    this.state = this.state.filter((x) => {
      if (!is_it(x))
        return true;
      const y = x as It;
      return f(y);
    });
    return this;
  } // method

  async run(f?: Run_Filter) {
    const promises: Array<Promise<any>> = [];
    for (const x of this.state) {
      if (x.hasOwnProperty("it")) {
        let it = x as It;
        if (f && !f(it)) {
          continue;
        }
        const a = new Assert(it);
        const new_p = it.body(a).then(() => a.end()).catch((e) => {
          it.pass = false;
          if (e.message !== "recorded") {
            it.results.push({
              name: "unknown",
              pass: false,
              values: [],
              error: e
            });
          }
        });
        promises.push(new_p);
      }
    } // for
    await Promise.allSettled(promises);
    return this.state;
  } // method
} // class

class Assert {
  results: Array<Assert_Result>;
  it: It;

  get pass() {
    const results = this.results;
    return !results.find(x => !x.pass);
  } // getter

  constructor(it: It) {
    this.it = it;
    this.results = [];
  } // constructor

  equal(x: any, y: any) {
    try {
      EQUAL(x, y);
      const result = {
        name: "deepEqual",
        pass: true,
        values: [x, y]
      }
      this.results.push(result);
      return result;
    } catch(e) {
      const result = {
        name: "deepEqual",
        pass: false,
        values: [x, y],
        error: e
      }
      this.results.push(result);
      throw new Error("recorded");
      return result;
    }
  } // method

  end() {
    if (this.results.length === 0) {
      this.results.push({
        name: "at_least_one_assertion",
        pass: false,
        values: []
      });
      throw new Error("recorded");
    }
    return this;
  } // method

  deepEqual(x: any, y: any) {
    try {
      EQUAL(x, y);
      const result = {
        name: "deepEqual",
        pass: true,
        values: [x, y]
      }
      this.results.push(result);
      return result;
    } catch(e) {
      const result = {
        name: "deepEqual",
        pass: false,
        values: [x, y],
        error: e
      }
      this.results.push(result);
      throw new Error("recorded");
      return result;
    }
  } // method

} // class

const evan = new Evan();

function describe(title: string) {
  return evan.describe(title);
} // function

function it(title: string, f: It_Function | It_Asyn_Function) {
  return evan.it(title, f);
} // function

export { Evan, evan, describe, it, Assert};
export type { Describe, It, State, StateKV, Assert_Result};

