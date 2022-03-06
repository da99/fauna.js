#!/usr/bin/env sh

set -u -e -o pipefail
THIS_DIR="$(realpath "$( dirname "$(realpath "$0")" )/..")"

# set -x

DA_DIR="$THIS_DIR" deno run \
  --quiet                                         \
  --allow-env="DA_DIR"                            \
  --allow-read="${THIS_DIR}/,./"                  \
  --allow-write="./,./bin/,./spec/,./src/,./tmp/" \
  "${THIS_DIR}/bin/_da.ts" $@
