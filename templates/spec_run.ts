#!/usr/bin/env sh
#
#
set -u -e -o pipefail

mkdir -p tmp/spec

IS_TEST="yes" deno run \
  --allow-net=deno.land,raw.githubusercontent.com \
  --allow-read="./,tmp/spec" \
  --allow-write="tmp/spec" \
  spec/__.ts
