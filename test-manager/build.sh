docker build -t test-manager -f test-manager/Dockerfile .
docker tag test-manager apiteamdevops/test-manager:0.0.1
docker push apiteamdevops/test-manager:0.0.1
cd test-manager