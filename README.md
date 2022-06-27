# fauna.ts
My utility belt for FaunaDB + node.
I only use Node for the FaunaDB NodeJS driver.
After updating the database design, I switch over to Deno.

# Status
Untested. This is too specific and my tastes are too weird for you people.

# Spec
```bash
sh/test quick
sh/test # all tests.
```

# Reference:

```javascript
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
