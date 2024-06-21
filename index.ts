import { config } from "./config";
import { Google } from "./google";
import * as oauth from "oauth4webapi";
import * as os from "node:os";
import * as path from "node:path";
import { startGeneration } from "./functions/generateSummary";
import { constructTemplate } from "./functions/constructTemplate";

const FILE_PATH = path.resolve("token.json");
const address = "http://localhost:6969";
const auth = Google({
  clientID: config.clientId!,
  clientSecret: config.secret!,
  scope:
    "openid https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly",
});
async function storeToken(token: oauth.OpenIDTokenEndpointResponse) {
  const createdAt = new Date().toISOString();
  await Bun.write(FILE_PATH, JSON.stringify({ token, createdAt }));
}

async function isTokenExpired() {
  try {
    const { token, createdAt } = await Bun.file(FILE_PATH).json();
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diff = now - created;
    if (diff > (token.expires_in - 60)! * 1000) {
      return true;
    }
  } catch (e) {
    return true;
  }
  return false;
}
async function getToken() {
  const { token } = await Bun.file(FILE_PATH).json();

  return token;
}

const callBackUri = new URL("callback", address);
const { state, url } = await auth.authorize(callBackUri.toString());
if (await isTokenExpired()) {
  if (os.platform() === "darwin") {
    Bun.spawn(["open", url.toString()]);
  } else {
    console.log(url.toString());
  }
} else {
  const url = new URL("dashboard", address);
  Bun.spawn(["open", url.toString()]);
}

Bun.serve({
  port: 6969,
  async fetch(request) {
    if (request.url.includes("callback")) {
      const res = await auth.callback(
        new URL(request.url, address),
        state,
        callBackUri.toString()
      );
      await storeToken(res);
      // const nextRes = await startGeneration(res);
      return new Response(Bun.file("html/index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    if (request.url.includes("dashboard")) {
      return new Response(Bun.file("html/index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
    if (request.url.includes("generate")) {
      const { searchParams } = new URL(request.url);
      const since = searchParams.get("since") + "T00:00:00Z";
      const until = searchParams.get("until") + "T23:59:59Z";
      const token = await getToken();
      const data = await startGeneration({ since, until }, token);

      const template = await constructTemplate(data!);
      return new Response(template, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    return new Response("nothing");
  },
});
