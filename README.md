# fauna.ts
My utility belt for FaunaDB + Deno + TypeScript.

# Status
Untested. This is too specific and my tastes are too weird for you people.

# Spec
```bash
sh/test quick
sh/test # all tests.
```

# Reference:

```typescript
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
