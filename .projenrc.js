const { JsiiProject } = require('projen');

const project = new JsiiProject({
  name: '@wheatstalk/xenu-checker',
  authorName: 'Josh Kellendonk',
  authorEmail: 'joshua@wheatstalk.ca',
  repository: 'https://github.com/wheatstalk/xenu-checker.git',
  bin: {
    'xenu-checker': 'bin/xenu-checker',
  },
});

project.gitignore.exclude('.idea', '*.iml');

project.synth();
