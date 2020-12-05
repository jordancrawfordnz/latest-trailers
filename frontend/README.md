# Latest Trailers: Frontend

## Purpose
Automatically plays the latest / now showing movie trailers.

**Full features:**
- Keeps track of which movies the user has seen trailers for.
- Plays trailers automatically.
- Automatically plays the next trailer once one is finished.
- Allows users to reset their seen trailers after watching them all so they can start over.
- Has an about page with information about the source of the content and other (possible) FAQ's.

## Deploying

1. Install dependencies with `npm install`
2. Ensure you have AWS Vault setup and configured with your AWS account.
3. Generate an AWS access key and run `aws-vault add [profile name]`.
4. Run `aws-vault exec [profile name] -- aws s3 ls` to validate your profile is setup correctly.
5. Run `aws-vault exec [profile name] -- npm run deployPreprod` to deploy preprod
6. Run `aws-vault exec [profile name] -- npm run deploy` to deploy prod

You may need to disable caching in your CDN to ensure the new version is shown.

## Running Locally
Run a local web server and visit the index page. This will expect the JSON files from the fetcher to be in the root directory.
