type CloudFlareConfig = {
  userId: string;
  apiKey: string;
};
async function run({ userId, apiKey }: CloudFlareConfig, body: any) {
  const model = "@cf/qwen/qwen1.5-14b-chat-awq";
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${userId}/ai/run/${model}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body,
    }
  );
  const result = await response.json();
  const parsedResult = safeParse(result.result.response);
  return parsedResult;
}

export async function getDailySummary(
  config: CloudFlareConfig,
  dailyEvents: string
) {
  const initialMessage = {
    role: "system",
    content: `You are a summarizer agent that concisely summarizes what the developer has worked on today in a valid json format. 
        You will get a series of commit messages and calendar events which you will need to summarize by product.
        Only return an array of the core tasks that were worked on. Write full sentences and infer the details a bit.
        The object should be structured as an array of objects with a product property and tasks for that product .
        Return nothing but the valid json object.
        for example:
        {
message: 'fix: metadata generation',
date: '2024-06-03T08:52:09Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'fix: modified logic for fetching locations for user trials',
date: '2024-06-03T09:26:07Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'Merge pull request #566 from smartseatsip/fix/locations/user-trials\n' +
'\n' +
'fix: modified logic for fetching locations for user trials',
date: '2024-06-03T10:05:05Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'fix: correct condition for location query with searchstring',
date: '2024-06-03T12:07:55Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'fix: rename new trial to full match',
date: '2024-06-03T12:44:51Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'fix: translation update',
date: '2024-06-03T13:13:37Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'Merge pull request #567 from smartseatsip/fix/email/templates\n' +
'\n' +
'Fix/email/templates',
date: '2024-06-03T13:22:45Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'fix: whitespace around images',
date: '2024-06-03T13:49:39Z',
workedOn: 'Curewiki backend',
type: 'commit'
},
{
message: 'fix: join on location instead of trial',
date: '2024-06-03T14:28:06Z',
workedOn: 'Curewiki backend',
type: 'commit'
}

should be summarized as this json and nothing else:

[
  {
    "product": "curewiki-backend",
    "tasks": [
      "Added company name and role to access requests.",
      "Integrated new trial notification flow.",
      "Renamed lambda DTOs to avoid metadata generation.",
      "Fixed whitespace issues and SQS receive permission.",
      "Debugged and filtered query, handled non-existent patients, and awaited notification sending.",
      "Added defensive programming for users without a disease in the database.",
      "Removed all contacts permission.",
      "Improved lambda execution and cloud watch event handling.",
      "Implemented trial counts for diseases.",
      "Added unassigned status and activated location-related lambda.",
      "Mended missing user trial statuses in overviews.",
      "Attended standup meeting (9:15-9:30 AM).",
      "Participated in the CleverKids Quarterly meeting (3:00-4:00 PM)."
    ]
  }
]`,
  };

  const messages = JSON.stringify({
    messages: [
      initialMessage,
      {
        role: "user",
        content: dailyEvents,
      },
    ],
  });
  let attempt = 0;
  while (attempt < 3) {
    try {
      const result = await run(config, messages);
      console.log(`summarized after ${attempt} attempts`);
      return result;
    } catch (e) {
      attempt++;
      console.log(`failed attempt ${attempt}`);
    }
  }
  console.log("failed to summarize");
  return {};
}
function safeParse(result: any) {
  const jsonResponseStartPosition = result.indexOf("```json");
  const jsonResponseEndPosition = result.indexOf(
    "```",
    jsonResponseStartPosition + 1
  );
  const jsonResponse = result.slice(
    jsonResponseStartPosition + 7,
    jsonResponseEndPosition
  );
  return JSON.parse(jsonResponse);
}
