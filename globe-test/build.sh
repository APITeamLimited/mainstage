docker build -t globe-test -f globe-test/Dockerfile .
docker tag globe-test apiteamdevops/globe-test:0.0.1
docker push apiteamdevops/globe-test:0.0.1
cd globe-test