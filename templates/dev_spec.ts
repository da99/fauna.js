#!/usr/bin/env sh
#
#
set -u -e -o pipefail

mkdir -p tmp/spec

deno_test_results="tmp/spec/deno.test.results"

deno test \
   --allow-net=localhost  \
   --allow-write=tmp/spec \
   --allow-read="./,tmp/spec" \
   spec/main.ts &>"${deno_test_results}" || (
  last_exit="$?"
  echo "!!! Deno.test:" >&2
  cat "${deno_test_results}" >&2 || :
  exit $last_exit
)
