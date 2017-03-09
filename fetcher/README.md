# Latest Trailers: Fetcher

## Purpose
This fetches trailers for upcoming and now showing movies from TheMovieDatabase and uploads the result to Amazon S3.

**Full features:**
- Does TMDB requests on a delay to avoid the API limit.
- Takes only trailers, ignoring other video content.
- Uploads results to S3.

## Config file
Build a config file of the format:

```
{
  "accessKeyId": "...",
  "secretAccessKey": "...",
  "region": "...",
  "tmdbKey": "..."
}
```

## Running
1. Install Node
2. Run `npm install`
3. Run `node index.js [path to config JSON file]`

## Docker

### Building
Use `docker build -t jordancrawford/latest-trailers-fetcher .`.

### Running
Use `docker run -v [config folder]:/usr/config jordancrawford/latest-trailers-fetcher`.

Don't forget that host mappings require absolute paths!
