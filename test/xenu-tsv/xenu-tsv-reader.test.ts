import * as path from 'path';
import { XenuLinkCollectorPredicate, XenuTsvReader } from '../../src/xenu-tsv';

jest.setTimeout(30000);

describe('xenu-tsv-reader', () => {
  test('iterates asynchronously', async () => {
    // GIVEN
    const reader = new XenuTsvReader(path.join(__dirname, 'iana.txt'));

    // WHEN
    let count = 0;
    for await (const line of reader.asyncIterator()) {
      expect(line).toHaveProperty('Address');
      expect(line).toHaveProperty('Type');
      expect(line).toHaveProperty('Status-Code');
      count += 1;
    }

    // THEN
    expect(count).toBeGreaterThan(1);
  });

  test('collects asynchronously', async () => {
    // GIVEN
    const reader = new XenuTsvReader(path.join(__dirname, 'iana.txt'));

    // WHEN
    const result = await reader.collect(XenuLinkCollectorPredicate.always());

    // THEN
    expect(result.length).toBeGreaterThan(1);
  });
});