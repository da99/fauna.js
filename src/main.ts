
import {F, run_in_node, CreateExpr, Select_Map_Paginate} from "./FaunaDB.ts";
import { split_whitespace } from "./String.ts";

// import {Migrator} from "./Migrator.ts";

const Equals = CreateExpr("Equals");
const Add    = CreateExpr("Add");
const Min    = CreateExpr("Min");
const Collections = CreateExpr("Collections");
const Indexes = CreateExpr("Indexes");


const results = await run_in_node({
      "FAUNA_SECRET_A": Deno.env.get("FAUNA_SECRET_TEST_A") || "",
      "FAUNA_SECRET_B": Deno.env.get("FAUNA_SECRET_TEST_B") || "",
      "FAUNA_SECRET":   Deno.env.get("FAUNA_SECRET_TEST_A") || "",
    },
    {
      collections: Select_Map_Paginate(Collections()),
      indexes: Select_Map_Paginate(Indexes()),

    }
);

console.log(results);

// const fauna_sync = new Migrator({
//   secret: process.env.FAUNA_SECRET,
//   domain: process.env.FAUNA_DOMAIN
// });

// fauna_sync.CreateRole({
//   name: "cloudflare_worker",
//   privileges: [
//     {
//       resource: Collection("screen_name"),
//       actions: {
//         read: true,
//         write: true,
//         create: true,
//         delete: false,
//         history_read: false,
//         history_write: false,
//         unrestricted_read: false
//       }
//     }
//   ]
// }) ;


// for (const name of split_whitespace("\
//   labeling screen_name console page mail permission_list\
//   upgrade club account keep_me_updated profile purchase configuration contact\
//   social_activity")) {
//   fauna_sync.CreateCollection({name, history_days: 1});
// } // for

// fauna_sync.CreateFunction({
//   name: "create_account",
//   body: Query(
//     Lambda(
//       ["email", "screen_name"],
//       Create(Collection("screen_name"), {
//         data: {
//           account: Select(
//             ["ref"],
//             Create(Collection("account"), { data: { email: Var("email") } })
//           ),
//           file_name: LowerCase(Var("screen_name")),
//           name: Var("screen_name")
//         }
//       })
//     )
//   ),
//   role: Role("cloudflare_worker")

// }); // create func

// (async function() {
//   await fauna_sync.load_schema();
//   // console.log(fauna_sync.schema);
//   fauna_sync.diff().forEach(x => {
//     if (x.resource_name === "labeling") {
//       console.log(x);
//     }
//     // console.log(`${x.action} ${x.resource_type} ${x.resource_name}`);
//   });
// })(); // function
