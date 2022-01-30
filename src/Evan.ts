
import assert from "assert";
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


class Evan {
  state: Array<Describe | It>

  constructor() {
    this.state = [];
  } // constructor

  print() {
    for (const result of this.state) {
      if (result.hasOwnProperty("describe")) {
        const x = result as Describe;
        console.log(`${CLC.bold.yellow("Describe")}: ${x.describe}`);
      } else if (result.hasOwnProperty("it")) {
        const x = result as It;
        if (x.pass) {
          console.log(`${CLC.yellow("- it")}: ${x.it}`);
        } else {
          console.log(`${CLC.red("- it")}: ${x.it}`);
          console.log(x.assert.results);
        }
      } else {
        throw new Error(`Unknown test type: ${JSON.stringify(result)}`);
      }
    } // for
  } // method

  push(x: Describe | It) {
    return this.state.push(x);
  }

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
let current_describe = "";

function describe(title: string) {
  current_describe = title;
  evan.push({describe: title});
  return evan;
} // function

function it(title: string, f:(a: Assert)=>void) {
  evan.push({
    it: title,
    pass: false,
    version: `${current_describe} ${title}`,
    body: f,
    body_string: f.toString(),
    assert: new Assert()
  });
  return evan;
} // function

export { Evan, evan, describe, it, Assert};
export type { Describe, It};

