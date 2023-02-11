#!/bin/sh

GOOS=linux GOARCH=amd64 go build -o server main.go

VERSION=$(node -pe "require('./package.json').version")

docker build -t coteh/cloudhawk:$VERSION .
docker tag coteh/cloudhawk:$VERSION coteh/cloudhawk:latest
