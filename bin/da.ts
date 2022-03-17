#!/usr/bin/env sh

set -u -e -o pipefail
THIS_DIR="$(realpath "$( dirname "$(realpath "$0")" )/..")"


case "$@" in
  "keep-alive reload")
    set -x
    deno run \
      --allow-run="pkill" \
      "${THIS_DIR}/bin/_da.ts" "$@"
    ;;
  "keep-alive "*)
    set -x
    deno run \
      --allow-run \
      "${THIS_DIR}/bin/_da.ts" __"$@"
    ;;
  *)
    DA_DIR="$THIS_DIR" deno run \
      --quiet                                         \
      --allow-env="DA_DIR"                            \
      --allow-run="pkill,deno,echo,node"              \
      --allow-net="deno.land"                         \
      --allow-read="${THIS_DIR}/,./"                  \
      --allow-write="./,./bin/,./spec/,./src/,./tmp/" \
      "${THIS_DIR}/bin/_da.ts"  "$@"
    ;;
esac


