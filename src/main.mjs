
import faunadb from 'faunadb';
import crypto from 'node:crypto';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
})

var q = faunadb.query
const {If, Exists, Update, Create, Collection, CreateCollection} = q;

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

export function migrate(doc) {
  let raw = doc.ref.raw || {};

  if (raw.collection) {
    let fin = Object.assign({}, doc);
    delete fin.ref;
    fin.name = raw.collection;
    fin.data = fin.data || {};
    fin.data.migrate_id = crypto.createHash('sha512').update(JSON.stringify(doc)).digest('hex');
    return If(Exists(doc.ref), Update(doc.ref, fin), CreateCollection(fin));
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
  throw new Error(`Invalid doc: ${JSON.stringify(doc)}`);
} // migrate

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
