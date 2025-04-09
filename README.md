# ywt-web

![](public/linabell.png)

This repository contains the source code and documentation for the `ywt` web application.

## Build

Use whatever build system you prefer. The following command will build the project using `yarn`:

```bash
yarn build
```

## Configuration & Deployment

You need to set environment variables for the application to run. You can do this by creating a `.env` file in the root directory of the project. The following environment variables are required:

- `NEXT_PUBLIC_API_URL`: The URL of the YWT API server.
