#!/usr/bin/env sh

set -u -e -o pipefail

da.ts build update "$(bin/config all)"

for x in $(find src -type f -name '*.ts') ; do
  echo "deno cache --reload "$x""
  deno cache --reload "$x"
done
