

import faunadb from 'faunadb';
import {schema} from './helper.mjs'
var q = faunadb.query

var client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
  domain: process.env.FAUNA_DOMAIN,
  port: 443,
  scheme: 'https'
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
})

async function main () {
  let get_design;
  try {
    get_design = await client.query(schema());
    console.log(get_design);
  } catch (err) {
    console.log(err);
  }
} // async function

main();
