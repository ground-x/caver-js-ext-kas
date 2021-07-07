#!/bin/bash

mkdir th

swagger-codegen generate \
-i ../../kas-ref-docs/openapi/en/services/th/v2.yaml \
-l javascript \
-o ./th \
-c ./config.json;