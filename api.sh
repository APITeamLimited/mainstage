docker build -t api . -f api/Dockerfile
docker tag api registry.gitlab.com/apiteamcloud/mainstage:api-latest
docker push registry.gitlab.com/apiteamcloud/mainstage:api-latest