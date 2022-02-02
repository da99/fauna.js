
import util from "util";
import {default as F} from "faunadb";

const {
  Paginate,
  Collections, Get,
  Function: FN,
  Database,
  Query,
  Create,
  CreateFunction,
  Collection,
  Var,
  LowerCase,
  Ref,
  Lambda,
  Select,
  Map,
  Functions,
  Indexes,
  Role,
  CreateRole,
  Roles,
  Equals
} = F.query;

function inspect(x) {
  return util.inspect(x, {depth: Infinity});
} // function


class Migrator {
  // client: F.Client;
  // __old_schema: Old_Schema | null;
  // __new_schema: New_Schema;

  constructor(client_values) {
    if (!client_values.secret) { throw new Error("Secret key not set."); }
    if (!client_values.domain) { throw new Error("Database domain not set."); }

    this.client = new F.Client(
      Object.assign(
        {},
        DEFAULT_CLIENT_VALUES,
        client_values
      )
    );

    this.__new_schema = {
      "functions":   {},
      "indexes":     {},
      "collections": {},
      "roles":       {}
    };

    this.__old_schema   = null;
  } // constructor

  async load_schema() {
    if (this.__old_schema) {
      throw new Error("Schema already loaded.");
    }
    this.__old_schema = await this.client.query({
      collections: Select_Map_Paginate(Collections()),
      functions: Select_Map_Paginate(Functions()),
      indexes: Select_Map_Paginate(Indexes()),
      roles: Select_Map_Paginate(Roles())
    });
    return this.__old_schema;
  } // method

  get old_schema()  {
    if (!this.__old_schema) {
      throw new Error("Schema not loaded.");
    }
    return this.__old_schema;
  } // method

  get new_schema()  {
    return this.__new_schema;
  }

  __CREATE_RESOURCE(resource_type, param_object) {
    const data = param_object.data || {};
    if (!data.hash_version) {
      data.hash_version = btoa(JSON.stringify(param_object));
    }
    param_object.data = data;
    this.new_schema[resource_type][param_object.name] = param_object;
    return param_object;
  } // method

  CreateRole(param_object) {
    return this.__CREATE_RESOURCE("roles", param_object);
  } // method

  CreateIndex(param_object) {
    return this.__CREATE_RESOURCE("indexes", param_object);
  } // method

  CreateFunction(param_object) {
    return this.__CREATE_RESOURCE("functions", param_object);
  } // method

  CreateCollection(param_object) {
    return this.__CREATE_RESOURCE("collections", param_object);
  } // method

  each_new_resource(f) {
    const new_schema = this.new_schema;
    for (const k of (Object.keys(new_schema))) {
      Object.values(new_schema[k]).forEach((r) => f(k, r));
    } // for
  } // method

  // static Select_Map_Paginate = Select_Map_Paginate;

  each_old_resource(f) {
    for(const k of (Object.keys(this.old_schema)) ) {
      for(const po of this.old_schema[k]) {
        f(k, po);
      }
    } // for
  } // method

  diff() {
    const old_schema = this.old_schema;
    const new_actions = [];

    this.each_new_resource((resource_type, new_r) => {
        const name = new_r.name;
        const old_r = find_name(this.old_schema[resource_type], name);
        if (old_r) {
          if (!same_version(old_r, new_r)) {
            new_actions.push({
              action: "update",
              resource_type,
              resource_name: name,
              param_object: new_r,
              fql: Update((old_r.ref), new_r),
              old_fql: old_r
            });
          } // if
        } else {
          new_actions.push({
            action: "create",
            resource_type,
            resource_name: name,
            fql: CreateResource(resource_type, new_r)
          });
        }
    }) // each_new_resource

    // Delete:
    this.each_old_resource((resource_type, old_r) => {
      const name = old_r.name;
      if (!this.new_schema[resource_type][name]) {
        new_actions.push({
          action: "delete",
          resource_type,
          resource_name: name,
          fql: Delete(old_r.ref),
          old_fql: old_r
        });
      }
    });

    return new_actions;
  } // method

} // class


let v = null;
const SECRET_KEY = process.env.FAUNADB_SECRET_KEY;
const body = process.argv[2];
console.error(inspect(body));
try {
  v = eval(`(${body})`);
  console.error(JSON.stringify({
    "you wrote": v,
    "as_string": v.toString(),
    "inspection": inspect(v)
  }));

const CLIENT = new F.Client({
  secret:    process.env.FAUNA_SECRET,
  port:      443,
  scheme:    "https",
  keepAlive: false,
  timeout:   5,
  domain:    "db.us.fauna.com"
});

} catch(e) {
  console.error(e);
  process.exit(1);
}
