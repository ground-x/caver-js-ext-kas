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
			model=${j%".js"}

			# echo $model

			# Changed model name from exports to acutal
			sed -i "s/ exports/ ${model}/g" $j

			# The formatting below converts the code format so that it can be used in caver-js-ext-kas.
			cnt=$(grep -o 'import' $j | wc -l)
			cmp=0
			if [ ${cnt} -gt ${cmp} ]; then
				# Use class and exports and also format class variable using "ModelName.prototype.varName"
				sed -i "s/export default class /class /g" $j
				tac $j | awk '/    }/ && ! seen {print "}"; seen=1} {print}'  | tac > tmp && mv tmp $j
				sed -i '$ s/}/module.exports = '${model}'/g' $j
				sed -i "s/'\(.*\)' = \(.*\)/${model}.prototype.\1 = \2/g" $j

				# Changed import to require
				sed -i "s/import\(.*\);/import\1/g" $j
				sed -i "s/import\(.*\)from \"\(.*\)\"/import\1from \'\2\'/g" $j
				sed -i "s/import\(.*\)from \(.*\)/const\1= require(\2)/g" $j
			fi

			# Modified path
			sed -i "s/'..\/ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i "s/'ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i "s/'model/'..\/model/g" $j
			
			# Refined class name to simple version
			sed -i "s/ model\// /g" $j
			sed -i "s/module:model\///g" $j

			# Add memberof tag to each methods and variables
			cnt=$(grep -o 'memberof' $j | wc -l)
			cmp=0
			if [ ${cnt} -eq ${cmp} ]; then
				sed -i '/return {'"$model"'}/ {a\
					* @memberof '"$model"'
				}' $j
				sed -i '/member {/ {a\
					* @memberof '"$model"'
				}' $j
				sed -i '/type {/ {a\
					* @memberof '"$model"'
				}' $j
			fi
			
			# Changed module to class
			sed -i "s/@module/@class/g" $j


			# Change tag from member to type for make it member variable
			# If tag is @member with `AnchorBlockRequest.prototype.operator = undefined` format,
			# jsDoc will generate docs with static variable. 
			members=$(grep -F '@member ' $j | rev | cut -d ' ' -f1 | rev)

			for item in ${members};do
				sed -i 's/} '"$item"'$/}/g' $j
			done
			sed -i "s/@member /@type /g" $j

			# Format empty brace without newline
			sed -i 'H;1h;$!d;x; s/{\n *}/{}/g' $j

			# Use Object instead of wrong model for anyof(or oneOf) to use Object
			sed -i "s/\[AnyOf\(.*\)Items\]/\[Object\]/g" $j
			sed -i "/AnyOf\(.*\)Items.call(this)/D" $j
			sed -i "s/{Models\(.*\)Yaml}/{Object}/g" $j
			sed -i "s/\(.*\)Models\(.*\)Yaml.constructFromObject(\(.*\))/\1ApiClient.convertToType(\3, Object)/g" $j
			sed -i "/Models\(.*\)Yaml/D" $j

			# Modify invalid 'ModelObject'
			sed -i "/const ModelObject/D" $j
			sed -i "s/ApiClient.constructFromObject(data, obj, 'ModelObject')/ApiClient.constructFromObject(data, obj, Object)/g" $j
			sed -i "s/{Array.<ModelObject>}/{Array.<Object>}/g" $j
			sed -i "s/obj\(.*\) = ApiClient.convertToType(\(.*\), ModelObject)/obj\1 = ApiClient.convertToType(\2, Object)/g" $j

			# Use Object instead of unused AccountUpdateKey model
			sed -i "s/\(.*\)AccountUpdateKey.constructFromObject(\(.*\))/\1ApiClient.convertToType(\2, Object)/g" $j

		done

      cd ../../;

      echo "Entering directory=${i}api";
	  cd ${i}api;

	  FILES=`ls`

		for j in ${FILES};do
			api=${j%".js"}

			# echo $api

			# Changed api name from exports to acutal
			sed -i "s/ exports/ ${api}/g" $j

			# The formatting below converts the code format so that it can be used in caver-js-ext-kas.
			cnt=$(grep -o 'import\(.*\)from' $j | wc -l)
			cmp=0
			if [ ${cnt} -gt ${cmp} ]; then
				# Use class and exports and also format class variable using "ModelName.prototype.varName"
				sed -i "s/export default class /class /g" $j
				echo "module.exports = ${api}" >> $j

				# Changed import to require
				sed -i "s/import\(.*\);/import\1/g" $j
				sed -i "s/import\(.*\)from \"\(.*\)\"/import\1from \'\2\'/g" $j
				sed -i "s/import\(.*\)from \(.*\)/const\1= require(\2)/g" $j
			fi

			# Modified path
			sed -i "s/'..\/ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i "s/'ApiClient'/'..\/..\/ApiClient'/g" $j
			sed -i "s/'model/'..\/model/g" $j

			# Refined class name to simple version
			sed -i "s/module:api\///g" $j
			sed -i "s/module:model\///g" $j
			sed -i "s/ api\// /g" $j
			sed -i "s/module://g" $j

			# Changed module to class
			sed -i "s/@module/@class/g" $j

			# Format empty brace without newline
			sed -i 'H;1h;$!d;x; s/{\n *}/{}/g' $j
		done
	  cd ../../;

done