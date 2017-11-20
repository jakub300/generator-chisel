#!/bin/bash

set -e

if [ "$TEST_VERSIONS" == "" ]; then
  eslint .
  mocha test/**/*.test.js -b --reporter spec
elif [ "$TEST_VERSIONS" == "generator" ]; then
  sudo npm install --quiet -g nsp nsp-preprocessor-yarn npm-check > /dev/null
  nsp check --preprocessor yarn || (exit 0)
  yarn
  npm-check -s || (exit 0)
elif [ "$TEST_VERSIONS" == "generated_project" ]; then
  sudo npm install --quiet -g nsp nsp-preprocessor-yarn npm-check ejs > /dev/null
  cd "$(dirname "$0")"
  npm install --quiet ejs > /dev/null
  mkdir generated_project
  node generate_package.js
  cd generated_project
  yarn
  nsp check --preprocessor yarn || (exit 0)
  npm-check -s || (exit 0)
else
  echo 'Bad value of $TEST_VERSIONS'
  exit 1
fi
