#!/bin/bash
echo "starting"
#su chatter
sudo -u chatter run_keybase -g
sudo --preserve-env -u chatter node /app/build/index.js