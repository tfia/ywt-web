# ywt-web

![](public/linabell.png)

This repository contains the source code and documentation for the `ywt` web application.

## Build

Use npm to install the dependencies and build the project:

```bash
npm install
npm run build
```

## Configuration & Deployment

You need to set environment variables for the application to run. You can do this by creating a `.env` file in the root directory of the project. The following environment variables are required:

- `NEXT_PUBLIC_API_URL`: The URL of the YWT API server.
- `NEXT_PUBLIC_DIFY_CHAT_URL`: The URL of the Dify chat bot.

You can directly deploy the application to Vercel or any other hosting service that supports Next.js. If you are using Vercel, you can set the environment variables in the Vercel dashboard.