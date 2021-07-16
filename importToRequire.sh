#!/bin/bash

cd src/rest-client/src

file='index.js'

sed -i '' "s/import\(.*\);/import\1/g" $file
sed -i '' "s/import\(.*\)from \"\(.*\)\"/import\1from \'\2\'/g" $file
sed -i '' "s/import\(.*\)from \(.*\)/const\1= require(\2)/g" $file