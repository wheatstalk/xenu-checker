import * as fs from 'fs';
import { DirectAddressMapper, TransposeDomainAddressMapper } from './address-mapper';
import { ConcurrentLinkChecker } from './concurrent-link-checker';
import { LinkChecker } from './link-checker';
import { ContentRegexCheck, StatusCheck } from './response-check';
import { IXenuLinkCollectorPredicate, XenuLinkCollectorPredicate, XenuTsvReader } from './xenu-tsv';

/**
 * Props for `CheckCommand`
 */
export interface CheckCommandProps {
  /** Path of the TSV file */
  readonly tsv: string;

  /**
   * Filter the TSV file by a JMESPath expression
   * @default - no filter so all links are collected from the tsv
   */
  readonly filter?: string;

  /**
   * Check the content of the response for this regex
   * @default - content is not checked
   */
  readonly checkRegex?: string;

  /**
   * Transpose the domain of the address in the TSV file to this new domain
   * @default - Domain is not transposed
   */
  readonly transposeDomain?: string;

  /**
   * Maximum concurrent links to check at once.
   * @default 100
   */
  readonly concurrency?: number;

  /**
   * A limit of the number of links to check
   * @default - no limit
   */
  readonly numLinks?: number;
}

/**
 * A command that checks links from a Xenu TSV file.
 */
export class CheckLinksCommand {
  /** @internal */
  public readonly collectorPredicate: IXenuLinkCollectorPredicate;
  /** @internal */
  public readonly addressMapper: DirectAddressMapper;
  /** @internal */
  public readonly linkChecker: LinkChecker;
  /** @internal */
  public readonly reader: XenuTsvReader;
  /** @internal */
  public readonly concurrency: number;
  /** @internal */
  public readonly numLinks?: number;

  constructor(props: CheckCommandProps) {
    if (!fs.existsSync(props.tsv)) {
      throw new Error(`${props.tsv} does not exist!`);
    }

    // Default concurrency of 100
    this.concurrency = props.concurrency ?? 100;
    // Default is not to limit the number of links checked.
    this.numLinks = props.numLinks;

    // When the filter is present, use a jmesPath link collector predicate.
    // Otherwise, collect everything.
    const predicate = props.filter
      ? XenuLinkCollectorPredicate.jmesPath(props.filter)
      : XenuLinkCollectorPredicate.always();

    // Create a reader for the tsv by its filesystem path.
    const reader = new XenuTsvReader(props.tsv);

    // When transposing, provide the transpose mapper, otherwise map the
    // address directly from the line.
    const addressMapper = props.transposeDomain
      ? new TransposeDomainAddressMapper({
        parentMapper: new DirectAddressMapper(),
        transposeDomain: props.transposeDomain,
      })
      : new DirectAddressMapper();

    // Build a list of checks to perform on the response.
    const checks = [
      new StatusCheck({ critical: true }),
    ];

    // Check the content for a given regex if requested.
    const contentRegex = props.checkRegex ? new RegExp(props.checkRegex) : undefined;
    if (contentRegex) {
      checks.push(new ContentRegexCheck({
        critical: false,
        contentRegex: contentRegex,
      }));
    }

    const linkChecker = new LinkChecker({ checks });

    this.reader = reader;
    this.linkChecker = linkChecker;
    this.addressMapper = addressMapper;
    this.collectorPredicate = predicate;
  }

  /**
   * Run the command.
   */
  async run() {
    const links = await this.reader.collect(this.collectorPredicate);
    // If the links are to be limited, select that many links from the front.
    const limitedLinks = this.numLinks ? links.slice(0, this.numLinks) : links;

    // Check the links concurrently.
    const checker = new ConcurrentLinkChecker({
      links: limitedLinks,
      linkChecker: this.linkChecker,
      addressMapper: this.addressMapper,
      concurrency: this.concurrency,
    });

    const result = await checker.start();

    console.log(JSON.stringify(result, null, 2));
  }
}
