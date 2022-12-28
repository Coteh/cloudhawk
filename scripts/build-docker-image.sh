#!/bin/sh

GOOS=linux GOARCH=amd64 go build -o server main.go

docker build -t cloudhawk .
