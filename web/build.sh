docker build -t web -f web/Dockerfile .
docker tag web apiteamdevops/web:0.0.1
docker push apiteamdevops/web:0.0.1
cd web