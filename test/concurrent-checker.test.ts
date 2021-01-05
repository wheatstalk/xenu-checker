import { DirectAddressMapper } from '../src/address-mapper';
import { ConcurrentLinkChecker } from '../src/concurrent-link-checker';
import { LinkChecker } from '../src/link-checker';
import { ContentRegexCheck, StatusCheck } from '../src/response-check';

jest.setTimeout(30000);

describe('concurrent checker', () => {
  test('Checks a bunch of urls', async () => {
    const addressChecker = new LinkChecker({
      checks: [
        new StatusCheck({ critical: true }),
        new ContentRegexCheck({
          critical: true,
          contentRegex: /http codes|\d{3}/i,
        }),
      ],
    });

    const mixin = { Type: 'text/html' };
    const checker = new ConcurrentLinkChecker({
      linkChecker: addressChecker,
      addressMapper: new DirectAddressMapper(),
      links: [
        { Address: 'https://httpstat.us/200', ...mixin },
        { Address: 'https://httpstat.us/200?sleep=500', ...mixin },
        { Address: 'https://httpstat.us/200?sleep=1000', ...mixin },
        { Address: 'https://httpstat.us/200?sleep=1500', ...mixin },
        { Address: 'https://httpstat.us/200?sleep=2000', ...mixin },
        { Address: 'https://httpstat.us/301', ...mixin },
        { Address: 'https://httpstat.us/302', ...mixin },
        { Address: 'https://httpstat.us/303', ...mixin },
        { Address: 'https://httpstat.us/500', ...mixin },
        { Address: 'https://httpstat.us/404?sleep=2000', ...mixin },
      ],
      concurrency: 5,
    });

    console.log = () => undefined;
    console.error = () => undefined;
    console.warn = () => undefined;

    await checker.start();
  });


});