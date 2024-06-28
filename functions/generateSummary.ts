import { getDailySummary } from "./aiSummarize";
import { config } from "../config";
import { getCalendar } from "./getCalendar";
import { getCommits } from "./getCommits";
import * as google from "@googleapis/calendar";
import * as oauth from "oauth4webapi";

export async function startGeneration({ since, until }: any, token: oauth.TokenEndpointResponse) {
  try {
    const auth = google.auth.fromJSON({
      type: "authorized_user",
      client_id: config.clientId,
      client_secret: config.secret,
      refresh_token: token.refresh_token,
    });
    const calendar = await getCalendar(auth, { since, until });
    const commits = await getCommits(config.githubToken!, { since, until });

    const sortedDataPoints = [...commits, ...calendar!].reduce(
      (acc, dataPoint) => {
        const truncatedDate = dataPoint.date!.slice(0, 10);
        if (!acc[truncatedDate]) acc[truncatedDate] = [dataPoint.data];
        else acc[truncatedDate].push(dataPoint.data);
        return acc;
      },
      {}
    );
    const sortedNestedCommits = Object.keys(sortedDataPoints)
      .map((key) => {
        const input = sortedDataPoints[key];
        const sortedInput = input.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return {
          [key]: sortedInput,
        };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});

    const datesAndSummaries = await Promise.all(
      Object.keys(sortedNestedCommits).map(async (key) => {
        const summary = await getDailySummary(
          config.cloudFlare,
          JSON.stringify(sortedNestedCommits[key])
        );
        return [key, summary];
      })
    );
    return datesAndSummaries.map(([date, products]) => ({ date, products }));
  } catch (e) {
    console.log(e);
  }
}
