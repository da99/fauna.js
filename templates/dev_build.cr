#!/usr/bin/env sh
#
#
set -u -e -o pipefail

mkdir -p tmp/spec

set -x
shards build -- --warnings all --release
