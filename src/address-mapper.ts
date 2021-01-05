import { IXenuLink } from './xenu-tsv';

/**
 * Interface for mapping a Xenu link to an address.
 */
export interface IAddressMapper {
  /**
   * Maps a xenu link to an address.
   * @param link
   */
  map(link: IXenuLink): string;
}

/**
 * Maps a link's `Address` directly to the value in that field.
 */
export class DirectAddressMapper implements IAddressMapper {
  map(link: IXenuLink): string {
    if (!link.Address) {
      throw new Error('Address field in Xenu line is missing');
    }

    return link.Address;
  }
}

/**
 * Props for `TransposeDomainAddressMapper`
 */
export interface TransposeDomainAddressMapperProps {
  /** The composable mapper to call to get the value to map from the line. */
  readonly parentMapper: IAddressMapper;

  /** The domain to transpose the link to. */
  readonly transposeDomain: string;
}

/** An expression that matches the domain part of a url */
export const DOMAIN_EXPRESSION = new RegExp('https?://[^/]+');

/**
 * Transposes the domain of a link to another domain.
 */
export class TransposeDomainAddressMapper implements IAddressMapper {
  constructor(private readonly props: TransposeDomainAddressMapperProps) {}

  map(line: IXenuLink): string {
    const address = this.props.parentMapper.map(line);
    const replaceValue = this.props.transposeDomain;
    return address.replace(DOMAIN_EXPRESSION, replaceValue);
  }
}