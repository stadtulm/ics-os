const withPrismaPlugin = require("next-prisma-plugin");

module.exports = withPrismaPlugin({
  // Necessary for next-on-netlify to work correctly
  target: process.env.NETLIFY ? "experimental-serverless-trace" : undefined,
  webpackDevMiddleware: (config) => {
    if (process.env.IS_DOCKER) {
      // "next dev" in Docker doesn't reliably pick up file changes, so we need to enable polling
      // see https://github.com/vercel/next.js/issues/6417 and https://webpack.js.org/configuration/watch/
      config.watchOptions = {
        ...config.watchOptions,
        poll: 500,
      };
    }
    return config;
  },
  images: {
    domains: ["tse1.mm.bing.net", "avatars.dicebear.com"],
  },
  webpack5: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
});
