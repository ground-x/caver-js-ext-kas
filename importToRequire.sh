#!/bin/bash

# ./importToRequire.sh {moudle name}

cd src/rest-client/src

file='index.js'

sed -i "s/import\(.*\);/import\1/g" $file
sed -i "s/import\(.*\)from \"\(.*\)\"/import\1from \'\2\'/g" $file
sed -i "s/import\(.*\)from \(.*\)/const\1= require(\2)/g" $file

apiName=$1
if [ -z "$apiName" ]; then
	echo "The path to import the module is not changed."
else
	# Modify './model/...' to './apiName/model/...' (and api path)
	sed -i "s/'.\/model\/\(.*\)/\'.\/$1\/model\/\1/g" $file
	sed -i "s/'.\/api\/\(.*\)/\'.\/$1\/api\/\1/g" $file

	# Modify '{module:model/modelName}' to '{modelName}' (and api name)
	sed -i "s/{module:model\/\(.*\)/{\1/g" $file
	sed -i "s/{module:api\/\(.*\)/{\1/g" $file
fi
