docker build -t store -f store/Dockerfile .
docker tag store apiteamdevops/store:0.0.1
docker push apiteamdevops/store:0.0.1
cd store