const PRIORITIES = require('./priorities');
const inquirer = require('inquirer');
const globby = require('globby');
const path = require('path');
const fs = require('fs-extra');
const { template, merge } = require('lodash');

const slash = (str) => str.replace(/\\/g, '/');

const CHISEL_TEMPLATE = /\.chisel-tpl(?:$|(?=\.))/;

module.exports = class CreatorPluginAPI {
  constructor(id, creator) {
    this.id = id;
    this.creator = creator;
    this.PRIORITIES = PRIORITIES;
  }

  schedule(...args) {
    return this.creator.schedule(...args);
  }

  async prompt(questions) {
    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    const questionsNormalized = questions.map((question) => {
      const questionCopy = { ...question };
      if (questionCopy.name) {
        questionCopy.name = `${this.id}.${questionCopy.name}`;
      }

      return questionCopy;
    });

    const answers = await inquirer.prompt(
      questionsNormalized,
      this.creator.data
    );

    merge(this.creator.data, answers);

    return this.creator.data;
  }

  async promptLocal(questions) {
    return inquirer.prompt(questions);
  }

  // @from is relative to creators directory
  async copy(from = ['**/*', '**/.*'], options = {}) {
    const {
      to = this.context,
      expandDirectories = true,
      base = 'template',
    } = options;
    // let { base = 'template' } = options;

    if (!Array.isArray(from)) from = [from];

    const creatorPath = path.resolve(__dirname, 'creators', this.id);
    const basePath = path.resolve(creatorPath, base);
    const basePathPosix = slash(basePath);
    const fromPath = from.map((p) => {
      return path.posix.join(basePathPosix, p);
    });
    const promises = [];
    const files = await globby(fromPath, { expandDirectories, cwd: base });

    files.forEach((file) => {
      const relative = path.relative(basePath, file);
      let target = path.resolve(this.creator.context, relative);

      // console.log({ ext, relative, target });
      if (file.match(CHISEL_TEMPLATE)) {
        target = target.replace(CHISEL_TEMPLATE, '');

        promises.push(
          fs
            .readFile(file, { encoding: 'utf8' })
            .then((fileBody) =>
              fs.outputFile(
                target,
                template(fileBody, { sourceURL: file })(this.creator.data)
              )
            )
        );
      } else {
        promises.push(fs.copy(file, target, { overwrite: true }));
      }
    });

    return Promise.all(promises);
  }
};
