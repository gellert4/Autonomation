# VEYRO

Production landing site for VEYRO — websites, systems, automation and growth.

## Conversion stack
- Working concept demos under `/demos/`
- Qualified lead form with lead score + grade
- UTM attribution + first-touch storage
- FormSubmit email delivery
- Consent-gated GA4 loader (disabled until a Measurement ID is added)
- GitHub Pages deployment

## GA4 activation
Edit `analytics-config.js` and set `ga4MeasurementId` to the GA4 Measurement ID (`G-XXXXXXXXXX`). Until then, no Google Analytics script is loaded and no analytics banner is shown.

## Search Console
After the final custom domain is registered, create a Domain property in Google Search Console and verify by DNS TXT. Then update canonical URLs, `siteUrl`, sitemap and GitHub Pages custom-domain settings.

## UTM examples
`/?utm_source=cold_email&utm_medium=email&utm_campaign=local_outreach&utm_content=restaurant`

## Domain recommendation
Preferred working domain: `madebyveyro.com` (verify availability again immediately before purchase).
