#!/bin/bash

mkdir wallet

swagger-codegen generate \
-i ../../kas-ref-docs/openapi/en/services/wallet/v2.yaml \
-l javascript \
-o ./wallet \
-c ./config.json;