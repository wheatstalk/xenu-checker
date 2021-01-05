# Xenu Link Checker

Xenu Link Checker checks the links discovered by [Xenu Link Sleuth](http://home.snafu.de/tilman/xenulink.html).
The purpose of this tool is to gain visibility into broken links on "v2"
(or later) website launches, so that you can know ahead of time whether you
have completed a 1-to-1 mapping of old site urls to new site urls.

This tool operates by reading the `.txt` (TSV) export of Xenu Link Sleuth crawl
and checks each link with some concurrency.

Features:

- Follow redirects to see if they result in an OK response.
- Check the contents of the page for a regex and produce a warning.
- Run the link checker from a CD pipeline or other automation system to monitor
  progress in implementing all old links.
- Filter links from the `.txt` file by JMESPath expression.
- Transpose the domain part of all links to another domain, such as a dev or test site.
- Checks are issued with configurable levels of concurrency
- Emits a JSON file which you can futher-process in your CD pipeline

## Example Usage

**Check text/html links from `mywebsite-com.txt` for the presence of the regex `/_next/` in the content**
```bash
npx -p @wheatstalk/xenu-checker xenu-checker \
  check \
  --filter "Type == 'text/html'" \
  --check-regex _next \
  --transpose-domain https://test.mywebsite.com \
  --concurrency 100 \
  mywebsite-com.txt
```