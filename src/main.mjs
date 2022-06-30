
import faunadb from 'faunadb';
import crypto from 'node:crypto';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
})

var q = faunadb.query
const {Do, Let, Equals, Var, Get, Select, If, Exists, Update, Create, CreateRole, CreateIndex, CreateFunction, CreateCollection} = q;

var client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
  domain: process.env.FAUNA_DOMAIN,
  port: 443,
  scheme: 'https'
});


// async function main () {
// } // async function
//
// main();

export {q, client};

export function migrate(...raw_docs) {
  let docs = Array.from(raw_docs).flat();
  return Do(...docs.map(x => _migrate(x)));
} // migrate

function _migrate(doc) {
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
        `No update necessary for ${JSON.stringify(doc.ref)}`,
        Update(doc.ref, fin)
      )
    ),
    create
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

