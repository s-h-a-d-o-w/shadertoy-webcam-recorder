#!/bin/bash
set -e

export CAPROVER_APP=shadertoy-webcam-recorder
export CAPROVER_TAR_FILE=./caprover_deployment.tar

yarn build
tar -cvf ./caprover_deployment.tar ./Dockerfile ./nginx.conf ./dist/*

export CAPROVER_URL=$CAPROVER_MACHINE_01
caprover deploy

export CAPROVER_URL=$CAPROVER_MACHINE_02
caprover deploy

rm caprover_deployment.tar
