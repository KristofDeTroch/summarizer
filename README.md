# Reporting

This project allows you to summarize your days based on git commits and google calendar.
To use it you need to set up a google project with an [api](https://console.cloud.google.com/apis/dashboard) that has the google calendar api enabled.
You also need an access token from [github](https://github.com/settings/tokens) and you need to set up a [cloudflare account](https://www.cloudflare.com/). All of these resources are free within this scope and don't require billing details.

Once all of these things are set up you need to create the `.env` file that you can use to run the program. An example looks like this:

```
CLIENT_ID=google-client-id
CLIENT_SECRET=google client-secret
GITHUB_TOKEN=github-token
CLOUDFLARE_USER_ID=cloud-flare-user-id
CLOUDFLARE_API_KEY=cloud-flare-api-key
```

A final configuration change that is needed to personalize are the author and the repository configuration ins the `getCommits` file.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun --env-file=.env index.ts
```

When the project is started it will open a browser with the google auth flow to authorize your application to read your calendar. Once consented you wil be redirected to a basic form where you need to input the start and end date of your range that you want to summarize.

Once this range is submitted all your commits and calendar events are aggregated into summary objects. The summary objects are aggregated by day and for each day a request is made to a cloudflare worker to summarize that days work. Finally everything is formatted into a basic html form.

This project was created using `bun init` in bun v1.1.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
