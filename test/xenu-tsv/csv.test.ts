import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv';

jest.setTimeout(30000);

test('csv module works', async () => {
  const tsvFile = path.join(__dirname, 'iana.txt');

  const out = fs.createReadStream(tsvFile).pipe(
    csv.parse({
      columns: true,
      delimiter: '\t',
      quote: false,
    }),
  );

  let count = 0;
  for await (const line of out) {
    expect(line).toHaveProperty('Address');
    expect(line).toHaveProperty('Type');
    expect(line).toHaveProperty('Status-Code');
    count += 1;
  }

  expect(count).toBeGreaterThan(5);
});