
import assert from "assert";
import * as FS from "fs";
const CLC: any = require('cli-color');

type Describe = {
  describe: string
} // type

type It = {
  it: string,
  pass: boolean,
  body: (a: Assert) => void,
  body_string: string,
  version: string,
  assert: Assert
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

function is_describe(x: Describe | It) {
  return x.hasOwnProperty("describe");
} // function

function is_it(x: Describe | It) {
  return x.hasOwnProperty("it");
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
        console.log(`${CLC.bold.blue("Describe")}: ${x.describe}`);
      } else if (result.hasOwnProperty("it")) {
        const x = result as It;
        if (x.pass) {
          console.log(`${CLC.green("- it")}: ${x.it}`);
        } else {
          console.log(`${CLC.red("- it")}: ${x.it}`);
          console.log(x.assert.results);
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

  it(title: string, f:(a: Assert)=>void) {
    return this.push({
      it: title,
      pass: false,
      version: `${this.current_describe} ${title}`.trim(),
      body: f,
      body_string: f.toString(),
      assert: new Assert()
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

  static load_from_file(fname: string) {
    const raw = FS.readFileSync(fname, {encoding:'utf8', flag:'r'});
    return new Evan(JSON.parse(raw));
  } // method

  save_to_file(fname: string) {
    return FS.writeFileSync(fname, JSON.stringify(this.state));
  } // method

  filter(f: (x: Describe | It) => boolean) {
    this.state = this.state.filter(f);
    return this;
  } // methodd

  filterIt(f: (x: It) => boolean) {
    return this.filter((x: Describe | It) => {
      if (is_describe(x))
        return true;
      if (is_it(x)) {
        return f(x as It);
      }
      return false;
    });
  } // methodd


  async run() {
    const promises: Array<Promise<any>> = [];
    for (const x of this.state) {
      if (x.hasOwnProperty("it")) {
        let it = x as It;
        promises.push(Promise.resolve(it.body(it.assert)));
      }
    } // for
    await Promise.allSettled(promises);
    this.forEachIt((x: It) => {
      x.pass = x.assert.end().pass;
    });
    return this.state;
  } // method
} // class

class Assert {
  results: Array<Assert_Result>;

  get pass() {
    const results = this.results;
    return !results.find(x => !x.pass);
  } // getter

  constructor() {
    this.results = [];
  } // constructor

  equal(x: any, y: any) {
    const result = {
      name: "equal",
      pass: (x === y),
      values: [x, y]
    }
    this.results.push(result);
    return result;
  } // method

  end() {
    if (this.results.length === 0) {
      this.results.push({
        name: "at_least_one_assertion",
        pass: false,
        values: []
      });
    }
    return this;
  } // method

  deepEqual(x: any, y: any) {
    try {
      assert.deepEqual(x, y);
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
      return result;
    }
  } // method

} // class

const evan = new Evan();

function describe(title: string) {
  return evan.describe(title);
} // function

function it(title: string, f:(a: Assert)=>void) {
  return evan.it(title, f);
} // function

export { Evan, evan, describe, it, Assert};
export type { Describe, It, State, StateKV, Assert_Result};

