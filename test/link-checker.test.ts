import { LinkChecker, LinkCheckerStatus } from '../src/link-checker';
import { ContentRegexCheck, StatusCheck } from '../src/response-check';
import { IXenuLink } from '../src/xenu-tsv';


describe('address checker', () => {
  const testLink: IXenuLink = {
    Address: '',
    Type: '',
  };

  test('checks for 200', async () => {
    // GIVEN
    const checker = new LinkChecker({
      checks: [
        new StatusCheck({ critical: true }),
      ],
    });

    // WHEN
    const result = await checker.check('https://httpstat.us/200', testLink);

    // THEN
    expect(result.status).toEqual(LinkCheckerStatus.OK);
  });

  test('follows redirects', async () => {
    // GIVEN
    const checker = new LinkChecker({
      checks: [
        new StatusCheck({ critical: true }),
      ],
    });

    // WHEN
    const result = await checker.check('https://httpstat.us/301', testLink);

    // THEN
    expect(result.status).toEqual(LinkCheckerStatus.OK);
  });

  test('warns when content regex fails', async () => {
    // GIVEN
    const checker = new LinkChecker({
      checks: [
        new ContentRegexCheck({
          critical: false,
          contentRegex: /NOT ON THIS PAGE/,
        }),
      ],
    });

    // WHEN
    const result = await checker.check('https://httpstat.us/200', testLink);

    // THEN
    expect(result.status).toEqual(LinkCheckerStatus.WARN);
  });

  test('matches content regex on a redirected page', async () => {
    // GIVEN
    const checker = new LinkChecker({
      checks: [
        new StatusCheck({ critical: true }),
        new ContentRegexCheck({
          critical: false,
          contentRegex: /NOT ON THIS PAGE/,
        }),
      ],
    });

    // WHEN
    const result = await checker.check('https://httpstat.us/301', testLink);

    // THEN
    expect(result.status).toEqual(LinkCheckerStatus.WARN);
  });

  test('warns when content regex fails on redirected page', async () => {
    // GIVEN
    const checker = new LinkChecker({
      checks: [
        new StatusCheck({ critical: true }),
        new ContentRegexCheck({
          critical: false,
          contentRegex: /NOT ON THIS PAGE/,
        }),
      ],
    });

    // WHEN
    const result = await checker.check('https://httpstat.us/301', testLink);

    // THEN
    expect(result.status).toEqual(LinkCheckerStatus.WARN);
  });

  test.each([404, 500])('complains about %ds', async (code) => {
    // GIVEN
    const checker = new LinkChecker({
      checks: [
        new StatusCheck({ critical: true }),
      ],
    });

    // WHEN
    const result = await checker.check(`https://httpstat.us/${code}`, testLink);

    // THEN
    expect(result.status).toEqual(LinkCheckerStatus.FAIL);
    expect(result.message).toMatch(/failure/i);
  });
});
