# fauna.ts
My utility belt for FaunaDB + node.
I only use Node for the FaunaDB NodeJS driver.
After updating the database design, I switch over to Deno.

# Status
Untested. This is too specific and my tastes are too weird for you people.

# Spec
```bash
sh/test
sh/test main|migrate|prune|...
```

# Reference:

```javascript
  import {force_prune, prune_able, q, client, schema, drop_schema, migrate} from "../src/main.mjs";
  const {If, Exists, ....} = q;

  await client.query(drop_schema());
  await client.query(schema());
  await client.query(migrate(doc1, [docs], doc2, ...));
  await client.query(prune_able(old_schema, schema));
  await client.query(force_prune(old_schema, schema));

  CreateRole({
    name: "cloudflare_worker_function",
    privileges: [
      {
        resource: Collection("screen_name"),
        actions: {
          read: true,
          write: true,
          create: true,
          delete: false,
          history_read: false,
          history_write: false,
          unrestricted_read: false
        }
      }
    ]
  }) ;
```
