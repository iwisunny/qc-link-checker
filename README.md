qc-link-checker
===

> A qingcloud docs broken links checker

## 1. Install

```shell
npm i qc-link-checker
```

## 2. Usage

```shell
 Usage: qc-lc [options] <entry>

  A qingcloud docs broken links checker

  Options:

    -v, --version          output the version number
    -d, --debug            verbose mode
    -l, --levels [levels]  crawl levels recursively
    -w, --write            write broken links to file
    -h, --help             output usage information


 Example:
   $ qc-lc docs.qingcloud.com --write --levels 3
```

### LICENSE
MIT