

/*
 * npm install less
 * deno run    \
 * --allow-net \
 * --allow-read=./ \
 *  path/to/this.file.ts
 *
 */

import { yellow, bold, green, red, bgRed, white } from "https://deno.land/std/fmt/colors.ts";
import nunjucks from "https://deno.land/x/nunjucks/mod.js";
import * as path from "https://deno.land/std/path/mod.ts";
import {run_or_throw, run} from "../../da.ts/src/Process.ts";
import {
  Application,
  Router,
  send,
  ServerSentEventTarget
} from "https://deno.land/x/oak/mod.ts";

const watches: Array<ServerSentEventTarget> = [];

const router       = new Router();
const app          = new Application();
const static_files = `${Deno.cwd()}/dist/Public`;

async function print(s: string) {
  return await Deno.writeAll(Deno.stderr, new TextEncoder().encode(s));
} // async function

const CONFIG = {
  "PORT": 5555,
  "public_dir": "src/Public",
  "html": {}
};

// =============================================================================
// === Logger:
// =============================================================================
app.use(async (ctx, next) => {
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

export async function render(file_path: string) {
  const ext = path.extname(file_path);
  switch (ext) {
    case ".css": {
      const less = path.join(CONFIG.public_dir, file_path).replace(/\.css$/, ".less");
      const { stdout } = await run_or_throw(`npx lessc ${less}`);
      return {code: 200, body: stdout, type: "css"};
    }
    case ".html": {
      const html = nunjucks.render(
        path.join(CONFIG.public_dir,file_path).replace(/\.html$/, ".njk"),
        CONFIG["html"]
      );
      return {code: 200, body: html, type: "html"};
    }
    case ".js": {
      const ts = path.join(CONFIG.public_dir,file_path).replace(/\.js$/, ".ts");
      const { files } = await Deno.emit(ts, { bundle: "module", });
      const body = files["deno:///bundle.js"];
      return {code: 200, body: body, type: "js"};
    }
  } // switch
  return {code: 418, body: "Unknown type: ${ext}", type: "text"};
} // export async function

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
  const filepath = `${context.params.name}/${context.params.file}`;
  try {
    const {code, body, type} = await render(filepath);
    if (code === 200) {
      context.response.body = body;
      context.response.type = type;
    } else {
      context.response.status = code;
      context.response.body   = `${body}`;
      context.response.type   = type;
    }
  } catch (err) { console.error(err.message); "ignore"; }
})
;

app.use( router.routes() );
app.use( router.allowedMethods() );

// =============================================================================
// === Static Files:
// =============================================================================
app.use(async (ctx, next) => {
  const filename = ctx.request.url.pathname;
  if (filename.match(/\.(otf|ttf|woff2?|ico|png|jpe?g|gif|css|js)$/)) {
    await send(ctx, filename, { root: static_files, index: "index.html" });
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

export async function start(config: Record<string, any>) {
  // === Signal: =================================================================
  Deno.addSignalListener("SIGUSR1", () => {
    console.log("reloading clients");
    watches.forEach(x => {
      try { x.dispatchMessage("reload"); } catch (e) { console.log(e); }
    });
  });

  // === listen: =================================================================
  Object.assign(CONFIG, config);
  return await app.listen({ port: CONFIG["PORT"] });
} // export async function
