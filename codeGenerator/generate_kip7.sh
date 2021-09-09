#!/bin/bash

mkdir kip7

swagger-codegen generate \
-i ../../kas-ref-docs/openapi/en/services/kip7/v1.yaml \
-l javascript \
-o ./kip7 \
-c ./config.json;