#!/bin/sh

printf "\n[-] Installing OS dependencies...\n\n"

apk update && apk add --no-cache build-base

printf "\n[-] Installing NPM dependencies...\n\n"

yarn

printf "\n[-] Building app...\n\n"

yarn run build

printf "\n[-] Pruning build dependencies...\n\n"

yarn --prod
