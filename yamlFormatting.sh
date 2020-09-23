#!/bin/bash

cd src
cd rest-client
cd src
 
DIRS=`ls -d ./*/`
 
for i in ${DIRS};do
      echo "Entering directory=${i}model";
      cd ${i}model;

	  FILES=`ls`

		for j in ${FILES};do
			model=$(grep -F '@module model/' $j | cut -d "/" -f2)
			echo $model

			# sed -i '' "s/ exports/ ${model}/" $j

			sed -i '' "s/ exports/ ${model}/" $j
			sed -i '' "s/'..\/ApiClient'/'..\/..\/ApiClient'/" $j
			sed -i '' "s/'ApiClient'/'..\/..\/ApiClient'/" $j
			sed -i '' "s/'model\/'/'..\/model\/'/" $j

		done

      cd ../../;
done