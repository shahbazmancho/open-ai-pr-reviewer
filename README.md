# Node App Review Tool

This is a Node.js application that uses the OpenAI API to generate review comments for pull requests on GitHub.

## Installation

1. Clone the repository
2. Install dependencies using `yarn install`
3. Create a `.env` file and add the necessary environment variables
4. Run the app using `yarn review`

## Usage

To use this app, simply run `yarn review` and it will generate review comments for the pull request specified in your `.env` file. You can customize the review settings by modifying the environment variables.

## Environment Variables

The following environment variables are required for this app to function:

- `GITHUB_PERSONAL_ACCESS_TOKEN`: Your personal access token for GitHub.
- `OPENAI_API_KEY`: Your API key for the OpenAI API.
- `REPOSITORY_OWNER`: The owner of the GitHub repository.
- `REPOSITORY_NAME`: The name of the GitHub repository.
- `PR_NUMBER`: The number of the pull request you want to review.

The following environment variables are optional:

- `REVIEW_EACH_LINE`: If set to `true`, the app will generate a review comment for each line of code that has changed in the pull request. If set to `false` (or not set at all), the app will generate a single review comment for the entire pull request.
