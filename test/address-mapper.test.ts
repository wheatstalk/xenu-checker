import { DirectAddressMapper, DOMAIN_EXPRESSION, TransposeDomainAddressMapper } from '../src/address-mapper';

describe('address field mapper', () => {
  test('passes through Address field', () => {
    // GIVEN
    const mapper = new DirectAddressMapper();

    // WHEN
    const result = mapper.map({ Address: 'https://www.example.com', Type: 'text/html' });

    // THEN
    expect(result).toEqual('https://www.example.com');
  });

  test('complains when field is missing', () => {
    // GIVEN
    const mapper = new DirectAddressMapper();

    // WHEN
    expect(() => {
      mapper.map({} as any);
    }).toThrow(/is missing/i);
  });

});

describe('transpose domain mapper', () => {
  test.each([
    ['https://www.example.com/foo/bar', 'http://www.google.com', 'http://www.google.com/foo/bar'],
    ['https://www.example.com', 'http://www.google.com/', 'http://www.google.com/'],
  ])('for %s | %s => %s', (source, transpose, expected) => {
    expect(source.replace(DOMAIN_EXPRESSION, transpose)).toEqual(expected);
  });

  test('transposes domains', () => {
    // GIVEN
    const mapper = new TransposeDomainAddressMapper({
      parentMapper: new DirectAddressMapper(),
      transposeDomain: 'http://www.google.com',
    });

    // WHEN
    const result = mapper.map({ Address: 'https://www.example.com/foo/bar', Type: 'text/html' });

    // THEN
    expect(result).toEqual('http://www.google.com/foo/bar');
  });
});