docker build -t mailman . -f mailman/Dockerfile
docker tag mailman registry.gitlab.com/apiteamcloud/mainstage:mailman-latest
docker push registry.gitlab.com/apiteamcloud/mainstage:mailman-latest