
import faunadb from 'faunadb';
import crypto from 'node:crypto';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
})

var q = faunadb.query;
const {Do, Let, Equals, Var, Get, Select, If, Exists, Update, Create, CreateRole, CreateIndex, CreateFunction, CreateCollection} = q;

var client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
  domain: process.env.FAUNA_DOMAIN,
  port: 443,
  scheme: 'https'
});


export {q, client};

function get_env(x) {
  const val = process.env[x];
  if (!val) {
    throw new Error(`${x} is not set in the ENVIRONMENT.`);
  }
  return val;
}

export async function fauna_migrate(...raw_docs) {
  let docs = Array.from(raw_docs).flat();
  return client.query(q.Map(
    docs.map(x => _fauna_migrate(x)),
    q.Lambda('migrate', Do(Var('migrate')))
  ));
} // migrate

function _fauna_migrate(doc) {
  const ref = doc.ref;
  if (!ref)
    throw new Error(`No ref specified for: ${JSON.stringify(doc)}`)
  const raw = doc.ref.raw;
  if (!raw)
    throw new Error(`No ref.raw specified for: ${JSON.stringify(doc.ref)}`)
  let create, migrate_id;
  const fin = Object.assign({data: {}}, doc);

  delete fin.ref;
  fin.data.migrate_id = migrate_id = crypto.createHash('sha512').update(JSON.stringify(doc)).digest('hex');

  for (const f of [CreateCollection, CreateFunction, CreateRole, CreateIndex]) {
    let key = f.name.replace('Create', '').toLowerCase();
    if (!(raw.hasOwnProperty(key)))
      continue;
    if (!fin.hasOwnProperty('name')) {
      fin.name = raw[key];
    }
    create = f(fin);
    break;
  } // for

  if (!create)
    throw new Error(`Invalid doc: ${JSON.stringify(doc)}`);

  return If(
    Exists(doc.ref),
    Let(
      {doc: Get(doc.ref), migrate_id: Select(['data', 'migrate_id'], Var('doc'))},
      If(
        Equals(migrate_id, Var('migrate_id')),
        0,
        Update(doc.ref, fin)
      )
    ),
    Select('ref', create)
  );
} // function _migrate

export function schema() {
  return q.Reduce(
    q.Lambda(
      ["acc", "coll"],
      q.Append(
        q.Select(
          "data",
          q.Map(
            q.Paginate(q.Var("coll")),
            q.Lambda("x", q.Get(q.Var("x")))
          )
        ), // Map
        q.Var("acc")
      ) // Prepend
    ), // Lambda
    [],
    [q.Roles(), q.Collections(), q.Functions(), q.Indexes()]
  ); // Reduce
} // export

function drop(x) {
  if (!process.env.IS_TEST) {
    throw new Error("drop(...) can only be used in IS_TEST environments.");
  }
  return q.Map(
    q.Paginate(x),
    q.Lambda("x", q.Delete(q.Var("x")))
  );
} // export function

export function drop_schema() {
  return q.Do(
    drop(q.Collections()),
    drop(q.Roles()),
    drop(q.Indexes()),
    drop(q.Functions())
  );
} // export

export function original_prune_able(old_schema, ...raw_docs) {
  let new_docs = Array.from(raw_docs).flat();
  // let old_refs = old_schema.map(d => d.ref.toString())
  let new_refs = new_docs.map(x => x.ref.toFQL());
  return old_schema.filter(d => !new_refs.includes(d.ref.toString()));
} // export

export function prune_able(...raw_docs) {
  const new_docs = Array.from(raw_docs).flat();
  const new_refs = new_docs.map(x => x.ref);
  return q.Filter(
    schema(),
    q.Lambda(
      "doc",
      q.Not(q.ContainsValue(q.Select('ref', q.Var('doc')), new_refs))
    )
  );
} // export

export function force_prune(...raw_docs) {
  return q.Map(
    prune_able(...raw_docs),
    q.Lambda(
      "doc",
      q.Delete(Select('ref', Var('doc')))
    )
  );
} // export


// =============================================================================
// GraphQL:
// =============================================================================

export async function graphql_migrate(body) {
  const domain = get_env('FAUNA_GRAPHQL');
  const secret = get_env('FAUNA_SECRET');
  const path = "/import?mode=merge";
  const resp = await fetch(`https://${domain}${path}`, {
    method: 'POST',
    body,
    headers: {
    'Authorization': `Bearer ${secret}`
    }
  });

  if (!resp.ok) {
    throw new Error(`fetch failed: ${path} ${resp.status} ${resp.statusText}`);
  }

  return await resp.text();
} // export graphql_migrate

export async function graphql(body) {
  const domain = get_env('FAUNA_GRAPHQL');
  const secret = get_env('FAUNA_SECRET');
  const resp = await fetch(`https://${domain}/graphql`, {
    method: 'POST',
    body: JSON.stringify({
      query: body
    }),
    headers: {
    'Authorization': `Bearer ${secret}`
    }
  });

  if (!resp.ok) {
    throw new Error(`fetch failed: /graphql ${resp.status} ${resp.statusText}`);
  }

  return await resp.json();
} // export graphql_migrate
