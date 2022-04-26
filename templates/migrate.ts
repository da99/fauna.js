
import {
  drop_schema, schema, query, new_ref, migrate,
  Select, CreateCollection, CreateFn, Collection, Collections,
  Lambda,
  Do, If, Exists, Query, Fn,
  delete_if_exists, collection_names,
  MigrateCollection, MigrateFn
} from "https://github.com/da99/fauna.ts/raw/main/src/fauna.ts";


export const SCHEMA = Do(Select(2, "a b c d e f".split(' ')));

await migrate(SCHEMA, "tmp/migrate.txt")
