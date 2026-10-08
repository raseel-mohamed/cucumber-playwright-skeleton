#!/usr/bin/env bash

run_test_for_env(){
  if [ $# -eq 0 ]; then
    echo "No environment provided"
    return 1
  fi
  env_var=$1
  type=$2
  echo "Running test in $env_var for $type"
  if [[ $env_var == "staging" ]]; then
    if [[ $type == "api" ]];then
      npm run test:staging
}