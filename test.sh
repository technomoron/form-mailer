#!/bin/sh

curl -X POST http://localhost:3776/api/v1/sendform \
  -F "formid=bjornform" \
  -F "field1=value1" \
  -F "file=@tsconfig.json"
 