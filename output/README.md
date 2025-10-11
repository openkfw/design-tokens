# README for the Folder Structure in /output

This document outlines the structure of the /output directory and its contents.

## Folder Structure

```
/output
├── /figma
├── /penpot
├── /json
├── /css
├── /js
├── /scss
└── /web_thirdparty_16px   (third-party)
```

The `/output` directory contains all available export formats for design and development integration, including Figma, Penpot, JSON, CSS, SCSS, and JavaScript files.


# 🧭 REM and Font Scaling Guidelines

All KfW web applications (e.g., KfW.de, MeineKfW, OKP) use a root REM value of 62.5% to ensure optimal readability and consistent scaling. 
This means that 1rem is equivalent to 10px. Never use a font size of 10px directly. Always rely on rem units for scalable and accessible typography.

Example:

```
html {
  font-size: 62.5%; /* 1rem = 10px */
}

body {
  font-size: 1.6rem; /* 16px */
}
```

For third-party systems where the REM root value cannot be modified (i.e., the default browser setting of 16px = 100%), use the assets provided in the `/web_thirdparty_16px` folder.
