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

### /figma and /penpot

These folders contain design specifications for Figma and Penpot, respectively. All tokens are specified with pixel values.

### /json

This folder contains specifications for documentation. All tokens are specified with pixel values.

### /web_stable_10px

This folder contains styles (CSS, SCSS, JS) for applications that adhere to the KfW standard of 10px = 1rem, such as MeineKfW, KfW.de, and the Online Credit Portal.


### /web_next_16px

This folder contains styles for applications that use 16px = 1rem (the default browser font size), such as third-party systems like Storybook and Frontify.
