# Latest Trailers: Fetcher

## Purpose
This fetches trailers for upcoming and now showing movies from TheMovieDatabase and saves the result to disk.

**Full features:**
- Does TMDB requests on a delay to avoid the API limit.
- Takes only trailers, ignoring other video content.
- Saves the results to disk in a JSON file.

## Configuration

Configure the fetcher using the following environment variables:

### `FETCHER_TMDB_KEY`

The API key from TMDB.

### `FETCHER_SAVE_PATH` (optional)

The path to put the JSON output files in. Don't use a ending slash.
If this is not provided, the current directory will be used instead.

### `FETCHER_SUCCESS_PUBLISH_URL` (optional)

A success URL to hit if fetch happens successfully.

## Config file
Build a config file of the format:

```
{
  "accessKeyId": "...",
  "secretAccessKey": "...",
  "region": "...",
  "tmdbKey": "...",
  "bucket": "...",
  "successPublishUrl": "..."
}
```

Optionally define a `successPublishUrl` to hit a URL after a successful fetch.

## Running
1. Install Node
2. Run `npm install`
3. Run `ENV_VAR_1=value ENV_VAR_2=value node index.js`

## Docker

### Building
Use `docker build -t jordancrawford/latest-trailers-fetcher .`.

### Running
Use `docker run -e ENV_VAR_1=value -e ENV_VAR_2=value jordancrawford/latest-trailers-fetcher`.
