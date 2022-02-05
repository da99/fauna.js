#!/usr/bin/env sh

set -u -e -o pipefail
THIS_DIR="$(realpath "$( dirname "$(realpath "$0")" )/..")"

# set -x

deno run \
  --quiet \
  --allow-read="${THIS_DIR}/,./" \
  --allow-write="./,./bin/,./spec/,./src/,./tmp/" \
  "${THIS_DIR}/bin/_da.ts" $@
