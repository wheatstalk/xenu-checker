import * as jmespath from 'jmespath';
import { IXenuLink } from './xenu-tsv-reader';

/**
 * Interface for a link collector predicate.
 */
export interface IXenuLinkCollectorPredicate {
  /** Returns true when the link matches the predicate */
  matches(link: IXenuLink): boolean;
}

function createFunctionalPredicate(matches: (link: IXenuLink) => boolean): IXenuLinkCollectorPredicate {
  return { matches };
}

export class XenuLinkCollectorPredicate {
  static always(): IXenuLinkCollectorPredicate {
    return createFunctionalPredicate(() => true);
  }

  static jmesPath(query: string) {
    let search: boolean;

    try {
      search = jmespath.search({}, query);
    } catch (e) {
      throw new Error(`JMESPath is invalid: ${e.message}`);
    }

    // noinspection PointlessBooleanExpressionJS
    if (typeof search !== typeof true) {
      throw new Error('JMESPath expression is not a boolean expression');
    }

    return createFunctionalPredicate(link => Boolean(jmespath.search(link, query)));
  }
}

/**
 * Collects links and filters them based on the given predicate.
 */
export class XenuLinkCollector {
  /** All collected links that match the predicate */
  public readonly links = new Array<IXenuLink>();
  private readonly predicate: IXenuLinkCollectorPredicate;

  constructor(predicate?: IXenuLinkCollectorPredicate) {
    this.predicate = predicate ?? XenuLinkCollectorPredicate.always();
  }

  /**
   * Collects a link if it matches the predicate.
   * @param link
   */
  collect(link: IXenuLink) {
    if (this.predicate.matches(link)) {
      this.links.push(link);
    }
  }
}