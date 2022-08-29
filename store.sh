docker build -t store . -f store/Dockerfile
docker tag store registry.gitlab.com/apiteamcloud/mainstage:store-latest
docker push registry.gitlab.com/apiteamcloud/mainstage:store-latest