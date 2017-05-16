#!/bin/bash
set -e

printf "\n[-] Performing final cleanup...\n\n"

# Clean out docs
rm -rf /usr/share/{doc,doc-base,man,locale,zoneinfo}

# Clean out package management dirs
rm -rf /var/lib/{cache,log}

# clean additional files created outside the source tree
rm -rf /root/{.npm,.cache,.config,.cordova,.local}
rm -rf /tmp/*

# npm cleanup
npm cache clean

# remove os dependencies
apt-get -y autoremove
apt-get -y clean
apt-get -y autoclean
apt-get purge -y --auto-remove build-essential python
rm -rf /var/lib/apt/lists/*
