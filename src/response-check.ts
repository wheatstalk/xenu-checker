import { Response } from 'node-fetch';
import { IXenuLink } from './xenu-tsv';

/**
 * The status of a response check.
 */
export enum ResponseCheckResultStatus {
  /** The check succeeded */
  OK = 'OK',
  /** The check failed */
  FAIL = 'FAIL',
}

/**
 * The result of a check
 */
export class ResponseCheckResult {
  constructor(public readonly status: ResponseCheckResultStatus, public readonly message: string, public readonly critical: boolean) {
  }

  get criticalFailure(): boolean {
    return this.status == ResponseCheckResultStatus.FAIL && this.critical;
  }
}

/**
 * Interface for checking a response.
 */
export interface IResponseCheck {
  /**
   * Checks the link and returns a check result.
   * @param address
   * @param line
   * @param response
   */
  check(address: string, line: IXenuLink, response: Response): Promise<ResponseCheckResult>;
}

/**
 * Props for `ResponseCheckBase`
 */
export interface ResponseCheckBaseProps {
  /**
   * Tells whether the check is a critical one. When a check is critical and
   * it fails, then the link fails. If the check isn't critical and the check
   * fails, then the link gets a warning.
   */
  readonly critical: boolean;
}

/**
 * Base class for response checks.
 */
abstract class ResponseCheckBase {
  public readonly critical: boolean;

  constructor(props: ResponseCheckBaseProps) {
    this.critical = props.critical;
  }
}

/**
 * Check that the HTTP status is an 'OK' result.
 */
export class StatusCheck extends ResponseCheckBase implements IResponseCheck {
  async check(_address: string, _line: IXenuLink, response: Response): Promise<ResponseCheckResult> {
    class CheckResult extends ResponseCheckResult {
      /** HTTP status code for the response */
      public readonly httpCode = response.status;
      /** HTTP status code text for the response */
      public readonly httpCodeText = response.statusText;
    }

    if (response.ok) {
      return new CheckResult(ResponseCheckResultStatus.OK, `Status code was ok: ${response.status} ${response.statusText}`, this.critical);
    } else {
      return new CheckResult(ResponseCheckResultStatus.FAIL, `Status code was not ok: ${response.status} ${response.statusText}`, this.critical);
    }
  }
}


/**
 * Props for `ContentRegexCheck`
 */
export interface ContentRegexCheckProps extends ResponseCheckBaseProps {
  /** Regular expression to test on the content of the page. */
  readonly contentRegex: RegExp;
}

/**
 * Checks that the content matches a regex.
 */
export class ContentRegexCheck extends ResponseCheckBase implements IResponseCheck {
  private readonly contentRegex: RegExp;

  constructor(props: ContentRegexCheckProps) {
    super(props);

    this.contentRegex = props.contentRegex;
  }

  async check(_address: string, _line: IXenuLink, response: Response): Promise<ResponseCheckResult> {
    const contentRegex = this.contentRegex.toString();
    class CheckResult extends ResponseCheckResult {
      public readonly contentRegex = contentRegex;
    }

    const bodyText = await response.text();
    if (this.contentRegex.test(bodyText)) {
      return new CheckResult(ResponseCheckResultStatus.OK, 'Content matched the RegExp', this.critical);
    } else {
      return new CheckResult(ResponseCheckResultStatus.FAIL, 'Content did not match the RegExp', this.critical);
    }
  }
}