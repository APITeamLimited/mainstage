docker build -t web -f web/Dockerfile .
docker tag web apiteamdevops/web:0.0.2
docker push apiteamdevops/web:0.0.2
cd web