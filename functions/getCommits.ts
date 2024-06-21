import axios from "axios";

const AUTHOR = "";
// example repo: { repo: "me/my-product", workedOn: "my product" }
const REPOS = [];

const urlRoot = "https://api.github.com/repos/";
const urlPath = "commits";
const per_page = 100;

export async function getCommits(
  gitToken: string,
  { since, until }: { since: string; until: string }
): Promise<{ date: string; data: any }[]> {
  if (!AUTHOR.length || !REPOS.length)
    throw new Error("Please fill in the AUTHOR and REPOS variables");
  let commits: any[] = [];
  for (const { repo, workedOn } of REPOS) {
    let endOfCommits = false;
    while (!endOfCommits) {
      const { data } = await axios.get(`${urlRoot}${repo}/${urlPath}`, {
        params: {
          author: AUTHOR,
          since: since.replace("T", "-"),
          until: until.replace("T", "-"),
          per_page,
        },
        headers: { Authorization: `Bearer ${gitToken}` },
      });

      if (data.length < per_page) endOfCommits = true;

      commits.push(
        ...data.map((c: any) => ({
          data: {
            message: c.commit.message,
            date: c.commit.author.date,
            workedOn,
            type: "commit",
          },
          date: c.commit.author.date,
        }))
      );
    }
  }

  return commits;
}
