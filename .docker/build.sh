#!/bin/sh

if [ "$1" == "--dev" ]; then
  printf "\n[-] Building development image...\n\n"
  docker build -f docker/dev.dockerfile -t reactioncommerce/skeletor:devel .
else
  docker build -t reactioncommerce/skeletor:latest .
fi
