#!/bin/bash

# ./generate_client_code.sh {service name} {version} {directory name} -> This case `master` branch will be used as a default
# ./generate_client_code.sh {service name} {version} {directory name} {branch}
# ./generate_client_code.sh anchor v1 anchor

branch=$4

if [ -z "$branch" ]; then
   branch="master"
fi

echo "Rest client code is generated from the yaml file in ${branch} branch."

# Make rest-client code.
cd ../../kas-ref-docs
make clean
git checkout $branch
git fetch upstream $branch
git reset --hard upstream/$branch
make .build/sdk/js/$1/$2

# Copy the rest-client code
cd ../caver-js-ext-kas
rm -rf ./src/rest-client/src/$3/*
mkdir ./src/rest-client/src/$3/api ./src/rest-client/src/$3/model
cp ../kas-ref-docs/.build/sdk/js/$1/$2/src/api/* ./src/rest-client/src/$3/api
cp ../kas-ref-docs/.build/sdk/js/$1/$2/src/model/* ./src/rest-client/src/$3/model

# Format the code
npm run lintFix

# Added latest yaml file
date=$(date '+%Y-%m-%d')
rm -rf ./yamls/$3/*
cp ../kas-ref-docs/.build/spec/$1/$2/openapi-versioned.yaml ./yamls/$3/${date}-openapi-versioned.yaml