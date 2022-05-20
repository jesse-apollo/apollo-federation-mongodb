include .env

deploy:
	echo "Running Google Cloud Build"
	@gcloud builds submit --substitutions=_MONGODB_CONN=${MONGODB_CONN}

publish:
	rover subgraph publish ${APOLLO_GRAPH_REF} --schema ./schema.graphql \
		--name ${SUBGRAPH_NAME} --routing-url ${ROUTING_URL}

check:
	rover subgraph check ${GRAPH_ID} \
	--schema=schema.graphql \
	--name=${SUBGRAPH_NAME} --validation-period=4weeks

build-docker:
	docker build . -t subgraph3

run-docker:
	docker run subgraph3 

run-local:
	nodemon -e js,graphql --exec 'make publish && PORT=9003 node server.js'
