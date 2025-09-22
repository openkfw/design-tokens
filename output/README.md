# README for the Folder Structure in /output

This document outlines the structure of the /output directory and its contents.

## Folder Structure

```
/output
├── /figma
├── /penpot
├── /json
├── /web_stable_10px (default)
└── /web_next_16px (third-party)
```

In the `/output` directory, you will find all available output formats for Figma, Penpot, JSON, and Web (CSS, SCSS, JS).

## Web Folder Usage

- `/web_stable_10px`: This folder should be used by default. We use it already for KfW.de, MeineKfW, OKP and other KfW applications. It uses a REM root value of 62.5% (1rem = 10px) for optimal readability.

- `/web_next_16px`: Use this folder for third-party systems where we cannot influence the REM root value and it corresponds to the standard browser font size of 16px (100%)

Note: A font size of 10px should never be used. Therefore, it is advisable to set the font size in the `<html>` to `62.5%` and `<body>` to `1.6rem` (16px).
