cd /app/
npm install 
npm install -g typescript
tsc
rm ./*.env
apt-get update
apt-get upgrade -y
curl --remote-name https://prerelease.keybase.io/keybase_amd64.deb
apt-get install -y ./keybase_amd64.deb
apt-get install -y sudo
chown chatter -R /app/*
chown chatter -R /app/
apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && rm /app/keybase_amd64.deb