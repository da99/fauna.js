
import { Text_File } from "../src/Text_File.ts";
import { bold as BOLD, blue as BLUE, green as GREEN, red as RED  } from "https://deno.land/std/fmt/colors.ts";

type It_Asyn_Function = () => Promise<void>;
type It_Function = () => void;

type Describe = {
  describe: string
} // type

type It = {
  it: string,
  pass: boolean,
  body: It_Asyn_Function,
  body_string: string,
  version: string,
  error?: Error
} // type

type Run_Result = {
  name: string,
  pass: boolean,
  values: Array<any>,
  error?: unknown
} // type

type State = Array<Describe | It>
type StateKV = {
  [key: string]: It
};

function is_describe(x: Describe | It) {
  return x.hasOwnProperty("describe");
} // function

function is_it(x: Describe | It) {
  return x.hasOwnProperty("it");
} // function

function is_async_function(x: any) {
  return x && x.constructor.name === "AsyncFunction";
} // function

class Spec {
  state: State;
  current_describe: string;

  constructor(old_state?: State) {
    this.state = old_state || [];
    this.current_describe = "";
  } // constructor

  exit_on_fail() {
    if (!this.pass) {
      Deno.exit(1);
    }
    return false;
  } // method

  print() {
    for (const result of this.state) {
      if (result.hasOwnProperty("describe")) {
        const x = result as Describe;
        console.log(`${BOLD(BLUE("Describe"))}: ${x.describe}`);
      } else if (result.hasOwnProperty("it")) {
        const x = result as It;
        if (x.pass) {
          console.log(`${GREEN("- it")}: ${x.it}`);
        } else {
          console.log(`${RED("- it")}: ${x.it}`);
          console.log(x.error);
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
      f = async () => { return raw_f(); }
    }
    return this.push({
      it:          title,
      pass:        false,
      version:     `${this.current_describe} ${title}`.trim(),
      body:        f as It_Asyn_Function,
      body_string: f.toString(),
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
    const old_e = new Spec(old)
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
    return this.its.length === 0;
  }

  get pass() {
    return !this.has_fails;
  } // method

  get has_fails() {
    return this.fails.length > 0;
  }

  get fails() : Array<It> {
    return this.its.filter((it: It) => {
      return !it.pass;
    });
  } // method

  static it_with_version(x: string) {
    return function(it: It) {
      return it.version === x;
    };
  } // static

  get its() : Array<It> {
    return this.state.filter((x: any) => is_it(x)) as Array<It>;
  } // get

  filter(f: (x: It) => boolean) {
    this.state = this.state.filter((x: It | Describe) => {
      if (!is_it(x))
        return true;
      const it = x as It;
      return f(it);
    });
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

  async run() {
    const promises: Array<Promise<any>> = [];
    for (const x of this.state) {
      if (is_it(x)) {
        let it = x as It;
        const new_p = it.body().then(() => {it.pass = true;}).catch((e) => {
          it.pass = false;
          if (e.message !== "recorded") {
            it.error = e;
          }
        });
        promises.push(new_p);
      }
    } // for
    await Promise.allSettled(promises);
    return this.state;
  } // method

  async run_last_fail(fn: string, before_save?: (e: Spec) => void) {
    const file = new Text_File(fn);

    if (file.text) {
      this.filter(Spec.it_with_version(file.text));
      if (this.is_empty)
        throw new Error(`No tests found for: ${file.filename}`);
    }
    await this.run();

    if (before_save) {
      before_save(this);
    }

    if (file.text) {
      if (spec.pass) {
        file.delete();
      }
    } else {
      if (spec.has_fails) {
        file.write(spec.fails[0].version);
      }
    }
    return this;
  } // method
} // class


const spec = new Spec();

function describe(title: string) {
  return spec.describe(title);
} // function

function it(title: string, f: It_Function | It_Asyn_Function) {
  return spec.it(title, f);
} // function

export { Spec, spec, describe, it};
export type { Describe, It, State, StateKV, Run_Result};

