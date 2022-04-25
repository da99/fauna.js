
import { yellow, bold, green, red, bgRed, white } from "https://deno.land/std/fmt/colors.ts";
import nunjucks from "https://deno.land/x/nunjucks/mod.js";
import {content_type, human_bytes, MB, sort_by_key, count} from "../src/Function.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {throw_on_fail, run} from "../../da.ts/src/Process.ts";
import {split_whitespace} from "../../da.ts/src/String.ts";
import {
  Application,
  Router,
  send,
  ServerSentEventTarget
} from "https://deno.land/x/oak/mod.ts";
import type {Context} from "https://deno.land/x/oak/context.ts";

const NUN = nunjucks.configure({noCache: true});

const watches: Array<ServerSentEventTarget> = [];

const router       = new Router();
const app          = new Application();

async function print(s: string) {
  return await Deno.writeAll(Deno.stderr, new TextEncoder().encode(s));
} // async function

function _run(cmd: string) {
  return throw_on_fail(run(cmd, "piped", "quiet"));
} // function

const CONFIG = {
  "port": 5555,
  "public_dir": "./",
  "render_cmd": split_whitespace("../bin/__ render")
};

async function read_file(file_path: string): Promise<string | null> {
  try {
    return Deno.readTextFile(file_path);
  } catch (e) {
    return null;
  }
} // function

export async function render(file_path: string): Promise<string> {
  const cmd: string[] = CONFIG.render_cmd.slice();
  cmd.push(file_path);
  const result = await throw_on_fail(run(cmd, "piped", "verbose"));
  return result.stdout;
} // export async function

export async function start(port: number, render_cmd: string[]) {
  Object.assign(CONFIG, {port, render_cmd});
  console.error(CONFIG);

  // =============================================================================
  // === Logger:
  // =============================================================================
  app.use(async (ctx: any, next: any) => {
    await print(`${yellow(ctx.request.method)} ${bold(ctx.request.url.pathname)} `);
    try {
      await next();
      switch (ctx.response.status) {
        case 200: {
          await print(`${green(ctx.response.status.toString())}`);
          break;
        }
        default: { await print(`${bgRed(white(ctx.response.status.toString()))}`); }
      } // switch

      print(` ${ctx.response.type}\n`);

      if (ctx.response.status === 418) {
        print(`${String(ctx.response.body)}\n\n`);
        ctx.response.body = "ERROR - CHECK CONSOLE OUTPUT FOR MORE INFORMATION.";
      }
    } catch (err) {
      await print(`${bgRed(white(err.name))}:${err.message}\n`);
      throw err;
    }
  });


  // =============================================================================
  // ==== Routes: ============================================================
  // =============================================================================
  router
  .get("/da.ts/watch", (ctx) => {
    const target = ctx.sendEvents();
    watches.pop();
    watches.push(target);
  })
  .get("/:name/:file", async (context) => {
    const filepath = path.join(context.params.name, context.params.file);
    try {
      const body = await read_file(filepath) || await render(filepath);
      context.response.body = body;
      context.response.type = content_type(filepath);
    } catch (err) {
      console.error(err.message);
      context.response.status = 500;
      context.response.body = Deno.inspect(err.message);
      context.response.type = content_type("error.txt");
    }
  })
  ;

  app.use( router.routes() );
  app.use( router.allowedMethods() );

  // =============================================================================
  // === Static Files:
  // =============================================================================
  app.use(async (ctx, next) => {
    const filename = ctx.request.url.pathname;
    if (filename.match(/\.(otf|ttf|txt|json|woff2?|ico|png|jpe?g|gif|css|js)$/)) {
      await send(ctx, filename, { root: CONFIG.public_dir, index: "index.html" });
      return;
    }

    await next();
  });


  // =============================================================================
  // === Listen:
  // =============================================================================
  app.addEventListener("listen", ({hostname, port}) => {
    console.error(`=== Listening on: ${hostname}:${green(port.toString())}`);
  });

  // === Signal: =================================================================
  Deno.addSignalListener("SIGUSR1", () => {
    console.log("reloading clients");
    watches.forEach(x => {
      try { x.dispatchMessage("reload"); } catch (e) { console.log(e); }
    });
  });

  // === listen: =================================================================
  return await app.listen({ port: CONFIG["port"] });
} // export async function
