#!/usr/bin/env bash

set -u -e -o pipefail

case "$*" in
  install)
    cd "$HOME/bin"
    url="$(curl -s https://api.github.com/repos/denoland/deno/releases/latest | grep -P 'browser_download_url.+linux' | cut -d'"' -f4)"
    filename="$(basename "$url")"
    touch deno.version
    if test "$(cat deno.version)" = "$(echo "$url"; ./deno --version || :)" ; then
      echo "=== Already installed: $url" >&2
      ./deno --version
      exit 0
    fi

    which unzip || exit 1
    if ! test -f "$filename"; then
      wget "$url"
    fi
    case "$filename" in
      *.zip)
        unzip -o "$filename"
        ;;
      *)
        echo "!!! Unable to decompress $filename" >&2
        exit 1
        ;;
    esac
    ./deno --version
    ( echo "$url"; ./deno --version ) > deno.version
    set -x
    rm -f "$filename"
    ;;

  *)
    echo "!!! Unknown command: $0 $*" >&2
    exit 2
    # if test -f "$1" || test -L "$1" ; then
    #   cmd="$(head -n1 "$1")"
    #   # shellcheck disable=SC2068,SC2086
    #   exec ${cmd:2} $@
    # fi
    #
    # # shellcheck disable=SC2068
    # deno $@
    ;;
esac
