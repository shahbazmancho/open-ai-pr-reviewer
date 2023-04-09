const { Octokit } = require("@octokit/rest");
const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const githubTOken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;
const owner = process.env.REPOSITORY_OWNER;
const repo = process.env.REPOSITORY_NAME;
const pull_number = process.env.PR_NUMBER;

const octokit = new Octokit({ auth: githubTOken });

const shouldCommitEachLine = process.env.REVIEW_EACH_LINE == "true";

const configuration = new Configuration({
  organization: "org-CzIqowwrBLc7fQIlREUOfSRq",
  apiKey: openaiApiKey,
});

const openai = new OpenAIApi(configuration);

async function getPullRequest() {
  const pullRequest = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  return pullRequest.data;
}

async function getPullRequestFiles() {
  const pullRequestFiles = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  return pullRequestFiles.data;
}

async function getReviewUsingOpenAi(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: ['"""'],
  });

  return response.data.choices[0].text;
}

async function createReviewComment(reviewText, commit_id, filename, line) {
  await octokit.pulls.createReviewComment({
    owner,
    repo,
    pull_number,
    body: reviewText,
    commit_id: commit_id,
    path: filename,
    line,
  });
}

async function fetchPullRequestAndReview() {
  const pullRequestData = await getPullRequest();
  const commitFilesData = await getPullRequestFiles();

  if (shouldCommitEachLine) {
    for (file of commitFilesData) {
      const { patch = "", filename = "" } = file;
      const diffLines = patch?.split("\n");
      const lineNumber = diffLines?.findIndex((line) => line?.startsWith("+"));
      if (lineNumber === -1) {
        continue;
      }
      const prompt = `Review the following change in file ${filename}:\n\n${diffLines[lineNumber]}`;
      const reviewText = await getReviewUsingOpenAi(prompt);

      await createReviewComment(
        reviewText,
        pullRequestData.head.sha,
        filename,
        lineNumber + 1 // TODO: need to figure out the correct line number
      );
    }
  } else {
    const diffFiles = commitFilesData.map((file) => file.filename).join("\n");
    const prompt = `Review the following changes in the pull request:\n\n${diffFiles}`;
    const reviewText = await getReviewUsingOpenAi(prompt);

    return await octokit.issues.createComment({
      owner,
      repo,
      issue_number: 1,
      body: reviewText,
    });
  }
}

fetchPullRequestAndReview();
