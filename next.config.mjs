/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default {
  output: 'export', // enable static export
  images: { unoptimized: true }, // no image optimization on static export
  // If you host under a subpath (user/organization page is root, project page needs basePath)
  basePath: isGitHubPages && process.env.REPO_NAME ? `/${process.env.REPO_NAME}` : undefined,
  assetPrefix: isGitHubPages && process.env.REPO_NAME ? `/${process.env.REPO_NAME}/` : undefined
};
