# Gateway

## Prereqs

 1. Install needed npm packages locally: `npm install`
 2. Edit .env to add your Apollo API key and Graph Reference.


## Run Locally

```
node server.js
```

## Deploy to GCP

```
make deploy
```

## Files

 * _.env/dot_env_ - stores environmental variables that are used for deployment
 * _.gcloudignore_ - makes Google Cloud ignore certain files
 * _cloudbuild.yaml{.tmpl}_ - the configuration file for Google Cloud Build which will build and deploy Docker containers and services in GCP
 * _Dockerfile_ - the file used to build a Docker container locally or in Cloud Build
 * _Dockerfile.unmanaged_ - an unmanaged Federation gateway container
 * _Makefile_ - a collection of command shortcuts
 * _package.json_ - package requirements for a NodeJS project
 * _server-unmanaged.js_ - the Apollo Gateway using unmanaged Federation
 * _server.js_ - the Apollo Gateway code