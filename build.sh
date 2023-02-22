docker build -t mainstage-base:latest .
./web/build.sh
./api/build.sh
./packages/entity-engine/build.sh
./packages/test-manager/build.sh
./packages/mailman/build.sh
./packages/store/build.sh
