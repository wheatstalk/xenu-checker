import * as path from 'path';
import { XenuLinkCollector, XenuLinkCollectorPredicate, XenuTsvReader } from '../../src/xenu-tsv';

jest.setTimeout(30000);

describe('predicates', () => {
  test('jmespath matches', () => {
    const pred = XenuLinkCollectorPredicate.jmesPath("Type == 'text/html'");
    expect(pred.matches({ Address: '', Type: 'text/html' })).toBeTruthy();
    expect(pred.matches({ Address: '', Type: 'text/plain' })).toBeFalsy();
  });

  test('jmespath complains when comparison is not a boolean predicate', () => {
    expect(() => {
      XenuLinkCollectorPredicate.jmesPath('location');
    }).toThrow(/is not a boolean expression/);
  });

  test('jmespath complains when expression is invalid', () => {
    expect(() => {
      XenuLinkCollectorPredicate.jmesPath('location";;');
    }).toThrow(/JMESPath is invalid/);
  });
});

describe('collector', () => {
  test('collects', () => {
    // GIVEN
    const collector = new XenuLinkCollector();

    // WHEN
    collector.collect({ Address: '', Type: '' });
    collector.collect({ Address: '', Type: '' });

    // THEN
    expect(collector.links).toHaveLength(2);
  });

  test('filters by jmespath', () => {
    // GIVEN
    const collector = new XenuLinkCollector(XenuLinkCollectorPredicate.jmesPath("Type == 'text/html'"));

    // WHEN
    collector.collect({ Address: '', Type: 'text/html' });
    collector.collect({ Address: '', Type: 'text/plain' });

    // THEN
    expect(collector.links).toHaveLength(1);
  });

  test('filters real tsv', async () => {
    const reader = new XenuTsvReader(path.join(__dirname, 'iana.txt'));
    const collector = new XenuLinkCollector(XenuLinkCollectorPredicate.jmesPath("Type == 'text/html'"));

    let count = 0;

    for await (const line of reader.asyncIterator()) {
      collector.collect(line);
      count += 1;
    }

    expect(collector.links.length).toBeGreaterThan(10);
    expect(count).toBeGreaterThan(collector.links.length);
  });
});
