
import faunadb from 'faunadb';
import crypto from 'node:crypto';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
})

var q = faunadb.query
const {Do, Let, Equals, Var, Get, Select, If, Exists, Update, Create, Collection, CreateCollection} = q;

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
  let raw = doc.ref.raw || {};
  let fin, ref, create, migrate_id;

  if (raw.collection) {
    fin = Object.assign({}, doc);
    delete fin.ref;
    if (!fin.name)
      fin.name = raw.collection;
    fin.data = fin.data || {};
    fin.data.migrate_id = migrate_id = crypto.createHash('sha512').update(JSON.stringify(doc)).digest('hex');
    create = CreateCollection(fin);
  } // if collection

  // if (raw.collection) {
  //
  // }
  //
  // if (raw.collection) {
  //
  // }
  // if (raw.collection) {
  //
  // }
  if (!migrate_id)
    throw new Error(`migrate_id not set for document: ${JSON.stringify(doc)}`);
  if (!fin || !create)
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

export function prune_able(old_schema, ...raw_docs) {
  let new_docs = Array.from(raw_docs).flat();
  let old_refs = old_schema.map(d => d.ref.toString())
  let new_refs = new_docs.map(x => x.ref.toFQL());
  return old_schema.filter(d => !new_refs.includes(d.ref.toString()));
} // export

