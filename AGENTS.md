# astro-template

This is a template repository for Astro sites with React, MDX, TypeScript, Tailwind, Biome, and shadcn/ui.

## Organization

- `content/*.{md,mdx}` - Posts loaded by Astro content collections.
- `public/theme.js` - Dark theme toggling script.
- `src/assets/*.{jpg,png,svg}` - Images and SVG assets imported by pages and components.
- `src/components/*.{astro,tsx}` - Interactive React components and static Astro components.
- `src/components/ui/*.tsx` - React shadcn/ui components.
- `src/icons/*.tsx` - React SVG icons not included in `lucide`.
- `src/layouts/Base.astro` - Site shell, SEO metadata, header, footer, and theme script.
- `src/lib/utils.ts` - Shared utility functions.
- `src/pages/**/*.{astro,ts}` - File-based Astro and endpoint routes.
- `src/styles/globals.css` - Tailwind theme, base styles, and global CSS.
- `src/config.json` - Site identity, navigation, social links, and resume.
- `src/content.config.ts` - Content collection schema for blog posts.

## Config

The central site configuration is `src/config.json`. It is consumed by layouts and components for metadata, navigation, social links, and URLs. Additionally, it provides content for the `About` and `Resume` pages.

Keep it in sync with `src/config.schema.json`, which defines the expected shape.

## Content

Pages use `Base.astro` as the layout and pass explicit `title` and `description` props. Blog content is loaded from the `blog` collection with `getCollection('blog')` and filtered through `filterDrafts` so drafts are hidden in production but visible locally during development.

Blog posts require this frontmatter:

```yaml
title: Post Title
description: Short post description.
pubDate: 2026-01-01  # ISO 8601
draft: true  # optional
```

The `title` is rendered above the post content, so a `# Title` heading is unnecessary.

## Routing

Use `withBase()` for internal `href` and asset URLs that need to work when Astro is deployed with a non-root `base`. External URLs, `mailto:`, `tel:`, and hash links are returned unchanged.

## Layout

`Base.astro` owns the HTML document, `astro-seo` setup, canonical URL, favicon, sitemap link, theme script, navigation, vertical spacing, and footer. Prefer changing shared document concerns there instead of duplicating them across pages.

The navigation receives static pages from `src/config.json`. Keep `src/config.json` updated when adding or removing top-level pages.

A mobile nav menu will be required if there are more than **4** pages.

## Styling

Use Tailwind utility classes and existing design tokens from `globals.css`. Use `cn()` for conditional class merging.

Biome enforces sorted Tailwind classes. Prefer running the fixer instead of manually reordering class lists.

### Formatting

Use StandardJS style:

```yaml
printWidth: 100
tabWidth: 2
useTabs: false
semi: false
singleQuote: true
quoteProps: as-needed
trailingComma: none
bracketSpacing: true
objectWrap: preserve
arrowParens: always
```

### Testing

Run `npm test`.

For React components, use Vitest with `happy-dom`. Prefer React's `act` and `createRoot` with plain DOM queries.

Only run tests if the components/utilities you're working on already have tests.

### TypeScript

Run `npm run check` or `tsgo -p .` to check TypeScript and Astro types.

### Linting

Run `npm run lint:fix` or `biome check --fix .` to check and fix linting issues.

### Building

Never run `npm start`, `npm run build` or `npm run preview`. Assume the dev server is already running.
