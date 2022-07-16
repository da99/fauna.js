
import faunadb from 'faunadb';
import crypto from 'node:crypto';
import * as fs from 'node:fs';

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

export async function fql_schema() {
  return await client.query(schema());
} // export function

export async function fql_migrate(...raw_docs) {
  let docs = Array.from(raw_docs).flat();
  const cache_file = "fql.migrate.txt";
  const contents = read_tmp_file(cache_file);
  const new_contents = JSON.stringify(docs);
  if (contents === new_contents)
    return false;
  const query_results = client.query(q.Map(
    docs.map(x => _fql_migrate(x)),
    q.Lambda('migrate', Do(Var('migrate')))
  ));
  write_tmp_file(cache_file, new_contents);
  return query_results;
} // migrate

function _fql_migrate(doc) {
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

export function gql_standard(content) {
  return content.replace(/\s+/g, ' ').trim() + '\n';
} // function

export async function gql_migrate(gql) {
  const domain      = get_env('FAUNA_GRAPHQL');
  const secret      = get_env('FAUNA_SECRET');
  const path        = "/import?mode=merge";
  const cache_file  = "gql.migrate.txt";
  const old_content = read_tmp_file(cache_file);
  const standard_content = gql_standard(gql);

  if (old_content === standard_content)
    return false;

  const resp = await fetch(`https://${domain}${path}`, {
    method: 'POST',
    body: gql,
    headers: {
      'Authorization': `Bearer ${secret}`
    }
  });

  if (!resp.ok)
    throw new Error(`gql_migrate: fetch failed: ${path} ${resp.status} ${resp.statusText}`);

  write_tmp_file(cache_file, standard_content)
  return await resp.text();
} // export gql_migrate

export async function gql_query(body) {
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
    throw new Error(`gql_query fetch failed: /graphql ${resp.status} ${resp.statusText}`);
  }

  return await resp.json();
} // export gql_migrate

export function schema_to_string(doc, old_schema) {
  return JSON.stringify([doc,old_schema]);
} // export function

function mkdir_p_tmp() {
  return fs.mkdirSync("tmp", {recursive: true});
} // export function

function read_tmp_file(raw_file_name) {
  const file_name = `tmp/${raw_file_name}`;
  mkdir_p_tmp();
  let contents = '';
  try {
    contents = fs.readFileSync(file_name, 'utf8');
  } catch (e) {
    fs.writeFileSync(file_name, '');
  }
  return contents;
} // export function

function write_tmp_file(raw_file_name, contents) {
  const file_name = `tmp/${raw_file_name}`;
  return fs.writeFileSync(file_name, contents);
} // export function


