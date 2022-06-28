
import faunadb from 'faunadb';
var q = faunadb.query

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
