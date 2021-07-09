#!/bin/bash

# ./generate_client_code.sh {service name} {version} {directory name}
# ./generate_client_code.sh anchor v1 anchor

# Make rest-client code.
cd ../../kas-ref-docs
sudo rm -rf .build/sdk/js/$1
git checkout dev
git fetch upstream dev
git reset --hard upstream/dev
make .build/sdk/js/$1/$2

# Copy the rest-client code
cd ../caver-js-ext-kas
sudo rm -rf ./src/rest-client/src/$3/*
mkdir ./src/rest-client/src/$3/api ./src/rest-client/src/$3/model
cp ../kas-ref-docs/.build/sdk/js/$1/$2/src/api/* ./src/rest-client/src/$3/api
cp ../kas-ref-docs/.build/sdk/js/$1/$2/src/model/* ./src/rest-client/src/$3/model

# Format the code
npm run lintFix

# Added latest yaml file
date=$(date '+%Y-%m-%d')
sudo rm -rf ./yamls/$3/*
cp ../kas-ref-docs/.build/spec/$1/$2/openapi-versioned.yaml ./yamls/$3/${date}-openapi-versioned.yaml