= KfW Design Tokens
:imagesdir: ./images

image::kfw-design-tokens.png[KfW Design Tokens]

# Notice

In the `/output` directory, you will find all available output formats for Figma, Penpot, JSON, and Web (CSS, SCSS, JS).

## Web Folder Usage

- `/web_stable_10px`: This folder should be used by default. We use it already for KfW.de, MeineKfW, OKP and other KfW applications. It uses a REM root value of 62.5% (1rem = 10px) for optimal readability.

- `/web_next_16px`: Use this folder for third-party systems where we cannot influence the REM root value and it corresponds to the standard browser font size of 16px (100%)

Note: A font size of 10px should never be used. Therefore, it is advisable to set the font size in the `<body>` to 1.6rem.

:numbered:

<<<<
// 1. What are Design Tokens?
include::chapters/What-are-Design-Tokens.md[]

<<<<
// 2. Support
include::chapters/Support.md[]

<<<<
// 3. Changelog
include::chapters/CHANGELOG.md[]
