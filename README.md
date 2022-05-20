# MongoDB Federation Demo

This codebase demonstrates how Apollo Federation can combine data from multiple
MongoDB clusters into a single, unified supergraph that allows for API-side
joins across multiple clusters.

 * subgraph1 - Airport and Air Carrier data cluster
 * subgraph2 - Airport Delay data cluster
 * subgraph3 - Aircraft manufacturer, engine, and registration (tail number) data cluster

## Run it Locally with Unmanaged Federation (Local Composition)

`make run-local-unmanaged`

## Run it Locally with Managed Federation

 1. Publish your schemas to Apollo
    1. Edit the `ROUTING_URL` in each of the subgraph directories `.env` file:  ./subgraph[1-3] __OR__ run `make setup` again to set them (recommended).
    2. Publish your graph with `make publish`
 2. Deploy locally: `make run-local-managed`

## Deploy everything to GCP

### Initial Setup (this only happens once)

 1. Install the Google Cloud CLI: https://cloud.google.com/sdk/docs/quickstart
 2. Login to the Google Cloud Console and create a new project
 3. Authenticate with Google Cloud: `gcloud init` (if you ever need to change your default Project ID (this might be different from the project name so always use the ID) use the command `gcloud config set project <project-ID>`)
 4. In the folder ./gateway & ./subgraph[1-3] folders edit the `cloudbuild.yaml` file to use your correct project ID (replace the <CHANGE_ME> in each of those) __OR__ use the setup tool by typing `make setup` (recommended)

### How to deploy

 1. Deploy your gateway and subgraphs with `make deploy`
 2. Check the Google Cloud Run Console to see the URLs for each of your services and your gateway.
 3. Update the `.env` files in ./subgraph[1-3] to have the right `ROUTING_URL` that you got from Cloud Run dashboard __OR__ use the setup tool by typing `make setup`
 4. Run `make publish` (this will run `make publish` in each of your subgraph directories, you can also run those one by one)
 5. Update studio with the right URL for your gateway.

 Steps 2, 3, and 5 should only need to be done the first time.  After that you can just use `make deploy` and `make publish`

## Files & Directories

 * _gateway/_ - the Apollo Gateway for this demo
 * _subgraph1/_ - a subgraph for this demo
 * _subgraph2/_ - a subgraph for this demo
 * _subgraph3/_ - a subgraph for this demo
 * _.gitignore_ - files that git should not manage
 * _local-test-unmanaged.yaml_ - a config file for Docker Compose to run an unmanaged Federation demo
 * _local-test.yaml_ - a config file for Docker Compose to run a managed Federation demo
 * _Makefile_ - a collection of command shortcuts
 * _supergraph.yaml_ - the config file that Rover uses to create a supergraph offline (ie, without Studio)
