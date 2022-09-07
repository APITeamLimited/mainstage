docker build -t entity-engine -f entity-engine/Dockerfile .
docker tag entity-engine apiteamdevops/entity-engine:0.0.1
docker push apiteamdevops/entity-engine:0.0.1
cd entity-engine