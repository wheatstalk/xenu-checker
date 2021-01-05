import * as fs from 'fs';
import * as csv from 'csv';
import { IXenuLinkCollectorPredicate, XenuLinkCollector } from './xenu-link-collector';

/**
 * Link information from Xenu.
 */
export type IXenuLink = {
  Address: string;
  Type: string;
} & Record<string, any>;

/**
 * Provides a reader for the Xenu TSV file given at `path`.
 */
export class XenuTsvReader {
  constructor(private readonly path: string) {
  }

  /**
   * Read the file using an async style iterator.
   * @example `for await (const link of reader.asyncIterator()) { ... }`
   */
  asyncIterator() {
    return fs.createReadStream(this.path).pipe(
      csv.parse({
        columns: true,
        delimiter: '\t',
        quote: false,
      }),
    );
  }

  /**
   * Collects the
   * @param predicate
   */
  async collect(predicate: IXenuLinkCollectorPredicate): Promise<IXenuLink[]> {
    const collector = new XenuLinkCollector(predicate);
    for await (const line of this.asyncIterator()) {
      collector.collect(line);
    }

    return collector.links;
  }
}