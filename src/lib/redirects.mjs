// @ts-check
/**
 * Old addresses → new addresses. Used by astro.config.mjs (`redirects`), which writes a small
 * page at each old address with a meta refresh, a canonical link and a visible link.
 * The table in docs/redirects.md lists the same map.
 *
 * The old site (Hugo, 2019–2023) put everything under /en/. Any /en/... address not listed here
 * is handled by the 404 page, which tries the same address without /en/ (src/pages/404.astro).
 */

/** Old Hugo post file name → new post folder (src/content/blog/<folder>/). */
export const OLD_POSTS = {
  cdo_install: 'cdo-install',
  imdlib_update_real: 'imdlib-update-real',
  climate_indices_imdlib: 'climate-indices-imdlib',
};

/** Old publication pages (/en/publication/<type>/<folder>/) → BibTeX keys in src/data/publications.bib. */
export const OLD_PUBLICATIONS = {
  article: {
    joh_2022: 'nandi2022integrated', // Journal of Hydrology 2022, VIC-RAPID-LISFLOOD-FP
    h20_2020: 'nandi2020comparative', // H2Open Journal 2020
    espr_2022: 'nandi2023heatwave', // Environ. Sci. Pollut. Res. (online 2022, 2023 volume)
    gc_2022: 'nandi2022imerg', // Geocarto International 2022
    ewra_2017: 'nandi2017distributed', // European Water 2017
    wrm_2020: 'nandi2020spatiotemporal', // Water Resources Management 2020
  },
  book: {
    cciwr_2021: 'nandi2021multiobjective', // Climate Change Impacts on Water Resources (Springer)
    wmwg_2021: 'nandi2020macroscale', // Water Management and Water Governance (Springer)
    picsnc_2021: 'nandi2021vic', // Proc. Int. Conf. on Scientific and Natural Computing (Springer)
    rfict_2018: 'swain2018arima', // Recent Findings in Intelligent Computing Techniques (Springer)
  },
  misc: {
    igarss_2017: 'swain2017spi', // IGARSS 2017
    i2ct_2017: 'swain2017regression', // I2CT 2017
  },
};

/** Old tag and category pages → new tag pages (tags that still exist on the new site). */
const OLD_TAGS = {
  climate: 'climate',
  tool: 'tool',
  softwares: 'software',
  installation: 'installation',
  cdo: 'cdo',
  hydrology: 'hydrology',
  imd: 'imd',
  github: 'github',
  pypi: 'pypi',
  conda: 'conda',
  imdlib: 'imdlib',
};
const OLD_CATEGORIES = { softwares: 'software', climate: 'climate', hydrology: 'hydrology', pypi: 'pypi' };

/** @type {Record<string, string>} */
export const redirects = {
  '/en': '/',
  '/en/about': '/',
  '/en/posts': '/blog/',
  '/en/archive': '/blog/',
  '/en/softwares': '/software/',
  '/en/softwares/imdlib': '/software/imdlib/',
  // Linked from the IMDLIB repository README (without /en/).
  '/softwares': '/software/',
  '/softwares/imdlib': '/software/imdlib/',
  '/posts': '/blog/',
  '/en/publication': '/publications/',
  '/en/presentation': '/',
  '/en/private': '/',
  '/en/tags': '/tags/',
  '/en/categories': '/tags/',
  '/en/series': '/blog/',
  ...Object.fromEntries(Object.entries(OLD_POSTS).map(([old, slug]) => [`/en/posts/${old}`, `/blog/${slug}/`])),
  ...Object.fromEntries(
    Object.entries(OLD_PUBLICATIONS).flatMap(([type, map]) => [
      [`/en/publication/${type}`, '/publications/'],
      ...Object.entries(map).map(([folder, key]) => [`/en/publication/${type}/${folder}`, `/publications/${key}/`]),
    ]),
  ),
  ...Object.fromEntries(Object.entries(OLD_TAGS).map(([old, tag]) => [`/en/tags/${old}`, `/tags/${tag}/`])),
  ...Object.fromEntries(Object.entries(OLD_CATEGORIES).map(([old, tag]) => [`/en/categories/${old}`, `/tags/${tag}/`])),
};
