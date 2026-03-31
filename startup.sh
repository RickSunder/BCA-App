#!/bin/bash
set -e
cd /home/site/wwwroot
npm install --production --prefer-offline
node node_modules/next/dist/bin/next start
