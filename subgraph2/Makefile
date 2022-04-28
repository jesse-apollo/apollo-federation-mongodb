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
	docker build . -t subgraph2

run-docker:
	docker run subgraph2 

run-local:
	nodemon -e js,graphql --exec 'make publish && PORT=9002 node server.js'