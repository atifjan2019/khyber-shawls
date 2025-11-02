/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://khybershawls.store',
  generateRobotsTxt: true,
  sitemapBaseFileName: 'sitemap', // -> /public/sitemap.xml
  changefreq: 'daily',
  priority: 0.7,
  // Exclude any dynamic or admin paths
  exclude: ['/admin/**', '/api/**', '/dashboard/**'],
}
