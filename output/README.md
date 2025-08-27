# README for the Folder Structure in /output

This document describes the structure of the `/output` directory and provides an overview of the files and folders contained within.


## Folder Structure

```
/output
├── /figma
├── /penpot
├── /json
├── /web_stable_10px
└── /web_next_16px
```
In the /output directory, you will find all available output formats for Figma, Penpot, JSON, and Web (CSS, SCSS, JS).

In the Web, we differentiate between `/web_stable_10px` and `/web_next_16px`, which use different REM root values. 
For KfW.de, MeineKfW, education, and other KfW applications, we use 62.5% (16px = 1.6rem) by default for readability 
reasons, meaning that 1rem equals 10px. In third-party systems where we cannot influence the REM root value and it 
corresponds to the standard browser font size of 16px (100%), /web_next_16px should be used instead. 
Please note that a font size of 10px should never be used. Therefore, it is advisable to set the font size in the `<body>` to 1.6rem.
