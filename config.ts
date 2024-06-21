export const config = {
  clientId: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  githubToken: process.env.GITHUB_TOKEN,
  cloudFlare: {
    userId: process.env.CLOUDFLARE_USER_ID!,
    apiKey: process.env.CLOUDFLARE_API_KEY!,
  },
};
