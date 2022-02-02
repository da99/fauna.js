// deno run --allow-run=setxkbmap src/Desktop/disable.capslock.ts
import { sleep } from "https://deno.land/x/sleep/mod.ts";

async function print_cmd(cmd: Array<string>) {
  console.error(Deno.inspect(cmd));
  const proc = Deno.run({
    cmd: cmd,
    stdout: 'piped'
  });

  const result = await proc.status();
  const so = new TextDecoder().decode(await proc.output());

  if (result.success) {
    return so;
  } else {
    return "";
    // Deno.exit(result.code);
  }
} // async function

while (true) {
  const map = await print_cmd(["setxkbmap", "-print" ]);

  if (map.length === 0) {
    await sleep(15);
    continue;
  }

  if (map.indexOf("capslock(none)") < 0) {
    // This next command doesn't print anything, so we can just await it.
    await print_cmd(["setxkbmap", "-option", "caps:none" ]);
  }

  await sleep(10);
} // while

