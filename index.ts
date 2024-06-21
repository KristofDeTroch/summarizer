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
async function storeToken(res: oauth.OpenIDTokenEndpointResponse) {
  await Bun.write(FILE_PATH, JSON.stringify(res));
}

const callBackUri = new URL("callback", address);
const { state, url } = await auth.authorize(callBackUri.toString());
console.log(`open the url in the browser '${url}'`);
if (os.platform() === "darwin") {
  Bun.spawn(["open", url.toString()]);
} else {
  console.log(url.toString());
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
    if (request.url.includes("generate")) {
      const { searchParams } = new URL(request.url);
      const since = searchParams.get("since") + "T00:00:00Z";
      const until = searchParams.get("until") + "T23:59:59Z";
      const token = await Bun.file(FILE_PATH).json();
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
