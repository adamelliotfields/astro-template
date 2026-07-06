# Astro Template

A mostly batteries included starter kit for a personal blog deployed to GitHub Pages.

## Features

- React, MDX, Tailwind, and shadcn/ui.
- Theme-aware [Shiki](https://github.com/shikijs/shiki) code blocks.
- GitHub blockquote [alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts).
- GitHub [emoji](https://github.com/ikatyang/emoji-cheat-sheet) shortcodes.
- [⌘K](https://github.com/dip/cmdk) command palette.
- [Pagefind](https://github.com/Pagefind/pagefind) search.
- [Fontsource](https://fontsource.org) fonts.
- [MathJax](https://github.com/mathjax/MathJax) notation.
- [LLMs.txt](https://llmstxt.org) and Markdown posts.
- Printer-friendly resume page.
- Client-side pagination.
- Table of contents.
- OpenGraph images.
- Previous/next links.
- External links.
- Header anchors.
- YouTube embeds.
- Gist embeds.
- Reading time.
- Draft posts.
- RSS feed.
- Sitemap.

## Installation

```sh
npx degit adamelliotfields/astro-template your-project
cd your-project
npm install
npm start
```

## Deployment

Change the `origin` property in [`config.json`](./src/config.json) to your production URL. This could be `<user>.github.io`, `<user>.github.io/<repo>`, or a custom domain. The Workflow is in [`build.yaml`](./.github/workflows/build.yaml).

See [creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) for more.

## Demo

[aef.me/astro-template](https://aef.me/astro-template)
