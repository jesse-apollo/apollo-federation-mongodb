include .env

deploy:
	echo "Running Google Cloud Build"
	@gcloud builds submit --substitutions=_APOLLO_KEY=${APOLLO_KEY},_APOLLO_GRAPH_REF=${APOLLO_GRAPH_REF}

build-docker:
	docker build . -f Dockerfile -t gateway

run-docker:
	docker run --env-file=.env gateway 

build-docker-unmanaged:
	docker build . -f Dockerfile.unmanaged -t gateway-unmanaged

run-docker-unmanaged:
	docker run gateway-unmanaged

run-local:
	cd .. && make supergraph-localhost
	nodemon -e js --exec 'PORT=9000 node server-unmanaged.js'