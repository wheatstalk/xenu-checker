import fetch from 'node-fetch';
import { IResponseCheck, ResponseCheckResult, ResponseCheckResultStatus } from './response-check';
import { IXenuLink } from './xenu-tsv';

export interface AddressCheckerProps {
  /**
   * Checks to check on the response.
   */
  checks: IResponseCheck[];
}

/**
 * Status.
 */
export enum LinkCheckerStatus {
  /** Everything is fine. */
  OK = 'OK',
  /** There has been a failure */
  FAIL = 'FAIL',
  /** Some failures, but none critical */
  WARN = 'WARN'
}

/**
 * Props for `LinkCheckerResult`
 */
export interface LinkCheckerResultProps {
  readonly address: string;
  readonly line: IXenuLink;
  readonly status: LinkCheckerStatus;
  readonly message: string;
  readonly responseCheckResults: ResponseCheckResult[];
}

/**
 * Response type for `LinkChecker.check()`
 */
export class LinkCheckerResult {
  public readonly status: LinkCheckerStatus;
  public readonly message: string;
  public readonly responseCheckResults: ResponseCheckResult[];
  public readonly address: string;
  public readonly line: IXenuLink;

  constructor(props: LinkCheckerResultProps) {
    this.status = props.status;
    this.message = props.message;
    this.responseCheckResults = props.responseCheckResults;

    this.address = props.address;
    this.line = props.line;
  }
}

/**
 * Checks links.
 */
export class LinkChecker {
  private readonly checks: IResponseCheck[];

  constructor(props: AddressCheckerProps) {
    this.checks = props.checks;
  }

  /**
   * Check the link
   * @param address
   * @param link
   */
  async check(address: string, link: IXenuLink): Promise<LinkCheckerResult> {
    const response = await fetch(address, {
      redirect: 'follow',
    });

    const responseCheckResults = new Array<ResponseCheckResult>();

    // Will be true if any checks fail.
    let shouldWarn = false;
    // Will be true if any critical checks fail
    let shouldCriticallyFail = false;

    for (const check of this.checks) {
      const result = await check.check(address, link, response);
      responseCheckResults.push(result);

      shouldCriticallyFail = shouldCriticallyFail || result.criticalFailure;
      shouldWarn = shouldWarn || result.status !== ResponseCheckResultStatus.OK;
    }

    if (shouldCriticallyFail) {
      return new LinkCheckerResult({
        address,
        line: link,
        status: LinkCheckerStatus.FAIL,
        message: 'Critical failures',
        responseCheckResults,
      } );
    } else if (shouldWarn) {
      return new LinkCheckerResult({
        address,
        line: link,
        status: LinkCheckerStatus.WARN,
        message: 'Warnings but no critical failures',
        responseCheckResults,
      });
    } else {
      return new LinkCheckerResult({
        address,
        line: link,
        status: LinkCheckerStatus.OK,
        message: 'No warnings or failures',
        responseCheckResults,
      });
    }
  }
}