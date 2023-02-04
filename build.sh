docker build -t mainstage-base:latest .
./web/build.sh
./api/build.sh
./entity-engine/build.sh
./test-manager/build.sh
./mailman/build.sh
./store/build.sh
