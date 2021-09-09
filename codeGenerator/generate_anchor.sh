#!/bin/bash

mkdir anchor

swagger-codegen generate \
-i ../../kas-ref-docs/openapi/en/services/anchor/v1.yaml \
-l javascript \
-o ./anchor \
-c ./config.json;