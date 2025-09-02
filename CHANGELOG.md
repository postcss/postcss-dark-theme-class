# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## 2.0.0
* Removed Node.js 18 support.
* Fixed types.

## 1.3.0
* Added `removeMedia` option (by @aletorrado).

## 1.2.3
* Fixed `light-dark()` support in complex values (by @VladBrok).
* Fixed source map for `light-dark()` (by @romainmenke).

## 1.2.2
* Fixed `!important` for `light-dark()` (by @yuheiy).

## 1.2.1
* Fixed function support inside `light-dark()` (by @VladBrok).

## 1.2.0
* Added `light-dark()` support (by @VladBrok).

## 1.1
* Added TypeScript types.

## 1.0
* Added `preferred-color-scheme: light` support (by Natalia Nagaeva).

## 0.8
* Moved to `:where()` to keep specificity.
* Removed Node.js 12, 14, and 16 support.
* Fixed docs (by Qi Luo).

## 0.7.3
* Reduced package size.

## 0.7.2
* Improved docs.

## 0.7.1
* Fixed compatibility with other PostCSS plugins.

## 0.7
* Added already transformed rules ignoring.

## 0.6
* Added `rootSelector` option.

## 0.5.2
* Fixed parsing comments in at-rule (by @nobuhikosawai).

## 0.5.1
* Added funding links.

## 0.5
* Moved to PostCSS 8.
* Moved `postcss` to `peerDependencies`.

## 0.4
* Replace `lightClass` with `lightSelector` (by Mattia Astorino).
* Replace `darkClass` with `darkSelector` (by Mattia Astorino).

## 0.3
* Add support for queries like
  `(min-width: 600px) and (prefers-color-scheme: dark)`.

## 0.2.2
* Show error on `.` in the beggining of `opts.darkClass` or `opts.lightClass`.

## 0.2.1
* Improve docs (by Martijn Cuppens).

## 0.2
* Add `lightClass`.

## 0.1
* Initial release.
