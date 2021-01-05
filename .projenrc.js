const { TypeScriptProject } = require('projen');

const project = new TypeScriptProject({
  name: '@wheatstalk/xenu-checker',
  authorName: 'Josh Kellendonk',
  authorEmail: 'joshua@wheatstalk.ca',
  repository: 'https://github.com/wheatstalk/xenu-checker.git',
  pullRequestTemplateContents: [
    '<!-- description of this change -->',
    '',
    '---',
    'By submitting this pull request, I confirm that my contribution is made under the terms of the Apache 2.0 license.',
  ],
  deps: [
    'csv@^5.3.2',
    'jmespath@^0.15.0',
    'sade@^1.7.4',
    'chalk@^4.1.0',
    'node-fetch@^2.6.1',
    '@supercharge/promise-pool@^1.6.0',
  ],
  devDeps: [
    '@types/jmespath',
    '@types/sade',
    '@types/node-fetch',
    'ts-node',
  ],
  bin: {
    'xenu-checker': 'bin/xenu-checker',
  },
});

// Intellij
project.gitignore.exclude('.idea', '*.iml');

project.gitignore.exclude('/tmp*');
project.gitignore.exclude('/SB.txt');

project.synth();
