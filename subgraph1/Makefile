include .env

deploy:
	gcloud builds submit

publish:
	rover subgraph publish ${APOLLO_GRAPH_REF} --schema ./schema.graphql \
		--name ${SUBGRAPH_NAME} --routing-url ${ROUTING_URL}

check:
	rover subgraph check ${GRAPH_ID} \
	--schema=schema.graphql \
	--name=${SUBGRAPH_NAME} --validation-period=4weeks

build-docker:
	docker build . -t subgraph1

run-docker:
	docker run subgraph1 

run-local:
	nodemon -e js,graphql --exec 'make publish && PORT=9001 node server.js'