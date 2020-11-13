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

			if [ -z "$model" ]; then
				model=$(grep -F '@alias ' $j | cut -d " " -f6)
			fi

			# echo $model

			# Changed model name from exports to acutal
			sed -i '' "s/ exports/ ${model}/g" $j

			# Modified path
			sed -i '' "s/'..\/ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i '' "s/'ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i '' "s/'model/'..\/model/g" $j
			
			# Refined class name to simple version
			sed -i '' "s/ model\// /g" $j
			sed -i '' "s/module:model\///g" $j

			# Add memberof tag to each methods and variables
			cnt=$(grep -o 'memberof' $j | wc -l)
			cmp=0
			if [ ${cnt} -eq ${cmp} ]; then
				sed -i '' '/return {'"$model"'}/ {a\
					* @memberof '"$model"'
				}' $j
				sed -i '' '/member {/ {a\
					* @memberof '"$model"'
				}' $j
				sed -i '' '/type {/ {a\
					* @memberof '"$model"'
				}' $j
			fi
			
			# Changed module to class
			sed -i '' "s/@module/@class/g" $j


			# Change tag from member to type for make it member variable
			# If tag is @member with `AnchorBlockRequest.prototype.operator = undefined` format,
			# jsDoc will generate docs with static variable. 
			members=$(grep -F '@member ' $j | rev | cut -d ' ' -f1 | rev)

			for item in ${members};do
				sed -i '' 's/} '"$item"'$/}/g' $j
			done
			sed -i '' "s/@member /@type /g" $j
		done

      cd ../../;

      echo "Entering directory=${i}api";
	  cd ${i}api;

	  FILES=`ls`

		for j in ${FILES};do
			api=$(grep -F '@module api/' $j | cut -d "/" -f2)

			if [ -z "$api" ]; then
				api=$(grep -F '@alias ' $j | cut -d " " -f8)
			fi

			# echo $api

			# Changed api name from exports to acutal
			sed -i '' "s/ exports/ ${api}/g" $j

			# Modified path
			sed -i '' "s/'..\/ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i '' "s/'ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i '' "s/'model/'..\/model/g" $j

			# Refined class name to simple version
			sed -i '' "s/module:api\///g" $j
			sed -i '' "s/module:model\///g" $j
			sed -i '' "s/ api\// /g" $j
			sed -i '' "s/module://g" $j

			# Changed module to class
			sed -i '' "s/@module/@class/g" $j

			# Format empty brace without newline
			sed -i '' 'H;1h;$!d;x; s/{\n *}/{}/g' $j
		done
	  cd ../../;

done