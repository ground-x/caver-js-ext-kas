#!/bin/bash

mkdir kip17

swagger-codegen generate \
-i ../../kas-ref-docs/openapi/en/services/kip17/v1.yaml \
-l javascript \
-o ./kip17 \
-c ./config.json;