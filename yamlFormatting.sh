#!/bin/bash

cd src
cd rest-client
cd src
 
DIRS=`ls -d ./*/`
 
for i in ${DIRS};do
echo ${i};
      echo "Entering directory=${i}model";
      cd ${i}model;

	  FILES=`ls`

		for j in ${FILES};do
			model=$(grep -F '@module model/' $j | cut -d "/" -f2)

			cp=' '
			if [${model} -eq ${cp} ]; then
				model=$(grep -F '@alias ' $j | cut -d " " -f8)
			fi

			echo $model
			# sed -i '' "s/ exports/ ${model}/" $j

			sed -i '' "s/ exports/ ${model}/" $j
			sed -i '' "s/'..\/ApiClient'/'..\/..\/ApiClient'/" $j
			sed -i '' "s/'ApiClient'/'..\/..\/ApiClient'/" $j
			sed -i '' "s/'model\/'/'..\/model\/'/" $j
			sed -i '' "s/ model\// /" $j
			sed -i '' "s/module:model\///" $j
			sed -i '' '/return {'"$model"'}/ {a\
			    * @memberof '"$model"'
			}' $j
			sed -i '' '/member {/ {a\
			    * @memberof '"$model"'
			}' $j
			sed -i '' "s/@module/@class/" $j
		done

      cd ../../;

      echo "Entering directory=${i}api";
	  cd ${i}api;

	  FILES=`ls`

		for j in ${FILES};do
			api=$(grep -F '@module api/' $j | cut -d "/" -f2)

			cp=' '
			if [${api} -eq ${cp} ]; then
				api=$(grep -F '@alias ' $j | cut -d " " -f8)
			fi

			echo $api

			sed -i '' "s/'..\/ApiClient'/'..\/..\/ApiClient'/" $j
			sed -i '' "s/'ApiClient'/'..\/..\/ApiClient'/" $j
			sed -i '' "s/'model\/'/'..\/model\/'/" $j
			sed -i '' "s/module:api\///" $j
			sed -i '' "s/module:model\///" $j
			sed -i '' "s/ api\// /" $j
			sed -i '' "s/module://" $j
			sed -i '' "s/@module/@class/" $j
		done
	  cd ../../;

done