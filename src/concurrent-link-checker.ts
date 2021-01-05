// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PromisePool = require('@supercharge/promise-pool');
import { IAddressMapper } from './address-mapper';
import { LinkChecker, LinkCheckerResult, LinkCheckerStatus } from './link-checker';
import { IXenuLink } from './xenu-tsv';

/**
 * Props for `ConcurrentLinkChecker`
 */
export interface ConcurrentLinkCheckerProps {
  /** List of links to check */
  links: IXenuLink[];

  /** The link checker */
  linkChecker: LinkChecker;

  /** The mapper from xenu links to addresses */
  addressMapper: IAddressMapper;

  /**
   * Maximum concurrent checks
   * @default 100
   */
  concurrency?: number;
}

/**
 * Checks the given links concurrently.
 */
export class ConcurrentLinkChecker {
  private concurrentRequests: number;

  constructor(private readonly props: ConcurrentLinkCheckerProps) {
    this.concurrentRequests = this.props.concurrency ?? 100;
  }

  /**
   * Start checking links. Returns all check results when it's done.
   */
  async start(): Promise<LinkCheckerResult[]> {
    const { links, linkChecker, addressMapper } = this.props;

    const results = await PromisePool
      .withConcurrency(this.concurrentRequests)
      .for(links)
      .handleError(error => {
        console.error(`Error! ${error}`);
      })
      .process(async line => {
        const address = addressMapper.map(line);
        const result = await linkChecker.check(address, line);

        if (result.status == LinkCheckerStatus.OK) {
          console.warn(`${address} - ${result.status} - ${result.message}`);
        } else {
          console.warn(`${address} - ${result.status} - ${result.message}:`);
          for (const responseCheckResult of result.responseCheckResults) {
            const criticalFailMarker = responseCheckResult.criticalFailure ? '!!!' : '';
            console.warn(`  * ${responseCheckResult.status}${criticalFailMarker} - ${responseCheckResult.message}`);
          }
        }

        return result;
      });

    return results.results;
  }
}