### edgefeed

> The toolkit for generate jsonfeed by web scraping, it runs on Cloudflare Workers.

#### Description

This is the toolkit to make web applications for generate jsonfeed by web scraping, and running on Cloudflare Workers.

This toolskit chould be able to make easy user-specifiec web applications, by edgefeed-specific [Hono](https://hono.dev/) middlewares, handlers or components.

This toolkit is _not_ frameworks or web applications. This is the collection of middlewares, handlers or components, no provides standalone web applications.

#### Goals

This toolkit is the alpha-stage software. It means to this toolkit may or may not have breaking changes by more development, no warranty to anything.

The target of this toolkit is to make small and personal web applications, with generate jsonfeed by web scraping.
It is _not_ targeted the middle or large scale softwares.

#### Contribution

At the moment, this project has no plans to accept any contribute by pull request,
if this project accept the pull request, it's after the make to contribution guides.

#### Components

- Middlewares
  - [basic-auth](./src/middlewares/by-name/ba/basic-auth.ts) - the basic auth middleware for personal single-user
  - [response-cache-r2](./src/middlewares/by-name/re/response-cache-r2.ts) - the response cache middleware, but it use Cloudflare R2 as cache storage
  - [response-cache](./src/middlewares/by-name/re/response-cache.ts) - the response cache middleware by cloudflare's `cache` interface
- Services (handlers)
  - [melonbooks](./src/services/by-name/me/melonbooks) - the converter handler to make jsonfeed from melonbooks's circle pages

#### License

- [BSD-3-Clause](./LICENSE.md)

#### Author

OKAMURA Naoki aka nyarla <nyarla@kalaclista.com>
