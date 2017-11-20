#!/bin/bash

set -e

if [ "$TEST_VERSIONS" == "" ]; then
  eslint .
  mocha test/**/*.test.js -b --reporter spec
elif [ "$TEST_VERSIONS" == "generator" ]; then
  sudo npm install --quiet -g nsp nsp-preprocessor-yarn npm-check > /dev/null
  nsp check --preprocessor yarn
  npm-check -s
elif [ "$TEST_VERSIONS" == "generated_project" ]; then
  sudo npm install --quiet -g nsp nsp-preprocessor-yarn npm-check ejs > /dev/null
  cd "$(dirname "$0")"
  mkdir generated_project
  node generate_package.js
  cd generated_project
  yarn
  nsp check --preprocessor yarn
  npm-check -s
else
  echo 'Bad value of $TEST_VERSIONS'
  exit 1
fi
