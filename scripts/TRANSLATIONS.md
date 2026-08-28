# Translation audit and JSON pipeline

## Audit summary (schemas)

All editable content types use `i18nFieldset` (`Translations`, collapsible + collapsed) and `localizedField()` companions for **es / de / nl / fr / ja / pt**:

| Schema | Localized fields |
|--------|------------------|
| `villa` | name, description |
| `activity` | title, duration, groupSize, description, whatsIncluded |
| `blog` | title, excerpt, content |
| `legendItem` | title |
| `review` | comment |
| `homePageSettings` | hero, featured, location, activities, reviews strings |
| `homePageSettings` nested | `featuredItems` (name, teaser), `thingsToDoItems` (title, description) |
| `aboutPageSettings` | welcome + ourPlace fields |
| `contactPageSettings` | title, subtitle, formTitle, infoTitle |
| `activitiesPageSettings` / `blogPageSettings` / `villasPageSettings` | title, subtitle |
| `systemSettings` | taxLabelEn |
| `systemSettings` nested | `checkoutFeeCatalog` (title per fee row) |

Not localized (by design): slugs, images, numbers, amenities tags, booking URLs, `formSubmission` inbox content.

**Checkout UI chrome** (step labels, thank you cards, form fields): `checkout` namespace in `src/lib/translations.js` (English + Spanish provided; other locales fall back to English via `useTranslation`).

## Frontend display behavior

Two layers work together:

1. **UI chrome** (nav, buttons, page titles, villa/activity copy keys): `resolveCopy()` in `src/lib/cms-field.js` prefers `translations.js` whenever `language !== "en"`. If a key is missing, `useTranslation` falls back to English.
2. **Blog posts**: `localizedField()` in `src/lib/localized.js` reads `titleEs` / `contentNl` / etc. from Sanity, then falls back to English.

English CMS remains the Studio source of truth. Locale companions in Sanity are filled by scripts (`translate:cms`, `translate:blog`, or this JSON pipeline) for editors and for blog rendering.

## JSON export / import

### 1. Export master JSON (English + any existing locales)

```bash
pnpm i18n:export
# or
npm run i18n:export
```

Default output: `translations/sanity-translations.json`

Options:

```bash
pnpm i18n:export -- --out=./translations/export.json
pnpm i18n:export -- --types=blog,villa,activity
```

### 2. Translate

Edit the JSON. Each field looks like:

```json
"title": {
  "kind": "string",
  "en": "Pool day at Blessed House",
  "es": "",
  "de": "",
  "nl": "",
  "fr": "",
  "ja": "",
  "pt": ""
}
```

For `kind: "blocks"`, write plain text; separate paragraphs with a blank line. Import converts them back to Portable Text.

Keep `en` unchanged. Fill the six locale keys.

### 3. Import (dry run first)

```bash
pnpm i18n:import -- --dry-run
pnpm i18n:import
```

Options:

```bash
pnpm i18n:import -- --in=./translations/sanity-translations.json
pnpm i18n:import -- --locales=es,nl --types=blog
```

Import only writes non-empty locale values. It never patches English source fields.

### Auth

Prefer `SANITY_API_WRITE_TOKEN` in `.env.local` (Editor or higher).  
Or use Sanity CLI login; the npm scripts run via `sanity exec ... --with-user-token`.

### Related scripts

| Script | Purpose |
|--------|---------|
| `pnpm translate:cms` | Fill CMS locale fields from `translations.js` |
| `pnpm translate:blog` | Machine-translate blog posts into Sanity locales |
| `pnpm i18n:export` / `i18n:import` | Manual JSON round-trip for any document type above |
