#!/bin/sh

# NTS: Localstack doesn't support CloudWatch Insights completely atm, but this will come in handy later when it does.

aws --endpoint http://localhost:4566 logs create-log-group --log-group-name test-logs

aws --endpoint http://localhost:4566 logs create-log-stream --log-group-name test-logs --log-stream-name test-log-stream

timestamp=$(($(date +'%s * 1000 + %-N / 1000000')))

aws --endpoint http://localhost:4566 logs put-log-events --log-group-name test-logs \
   --log-stream-name test-log-stream \
   --log-events \
    timestamp=$timestamp,message='"{\"foo\":\"bar\", \"hello\": \"world\"}"' \
    timestamp=$timestamp,message="my test event" \
    timestamp=$timestamp,message="another test message"
