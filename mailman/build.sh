docker build -t mailman -f mailman/Dockerfile .
docker tag mailman apiteamdevops/mailman:0.0.1
docker push apiteamdevops/mailman:0.0.1
cd mailman