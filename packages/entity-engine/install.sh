yarn install --inline-builds || true && yarn install --inline-builds
rm -rf config
rm -rf entity-engine/config
cd entity-engine && rm -rf dist && yarn build && cd ..
mkdir entity-engine/config
mv production.json entity-engine/config/production.json