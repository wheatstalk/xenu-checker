import * as process from 'process';
import * as sade from 'sade';
import { CheckLinksCommand } from '../check-links-command';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require('../../package.json');

// Check the text/html pages in xenu.txt for 404s on a new domain, follows redirects.
// xenu-checker check --filter "Type == 'text/html'" --transpose-domain https://www.example.com xenu.txt

// Check the text/html pages in xenu.txt for 404s or not a specific piece of content on a new domain, follows redirects.
// xenu-checker check --filter "Type == 'text/html'" --transpose-domain https://www.example.com --check-regex "_next" xenu.txt

// const program = new sade.Command('xenu-checker');
const prog = sade('xenu-checker');
prog.version(packageJson.version);

function runAsyncCommand(cb: () => Promise<void>) {
  void (async() => {
    try {
      await cb();
    } catch (e) {
      console.error(`${e}`);
      process.exit(1);
    }
  })();
}

const check = prog.command('check <tsv>');
check.action((tsv, args) => {
  const command = new CheckLinksCommand({
    tsv: tsv,
    filter: args.filter,
    checkRegex: args['check-regex'],
    transposeDomain: args['transpose-domain'],
    concurrency: parseInt(args.concurrency ?? '100'),
    numLinks: args['num-links'] ? parseInt(args['num-links']) : undefined,
  });

  runAsyncCommand(() => command.run());
});

check.option('-c, --concurrency <concurrency>', 'Sets request concurrency (default: 100)');
check.option('-f, --filter <filter>', 'Filters Xenu addresses by JMESPath');
check.option('-d, --transpose-domain <domain>', 'Transposes the domain from the Xenu file to a new site (e.g., a test site)');
check.option('-r, --check-regex <regex>', 'Checks the result of the final location for a regex');
check.option('-n, --num-links <num-links>', 'Limits the results to a number of links (default: no limit)');

prog.parse(process.argv);