docker build -t globe-test . -f globe-test/Dockerfile
docker tag globe-test registry.gitlab.com/apiteamcloud/mainstage:globe-test-latest
docker push registry.gitlab.com/apiteamcloud/mainstage:globe-test-latest