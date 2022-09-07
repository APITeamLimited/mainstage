docker build -t api -f api/Dockerfile .
docker tag api apiteamdevops/api:0.0.2
docker push apiteamdevops/api:0.0.2
cd api