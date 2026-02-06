# testingciworkersbuild

A simple Vite application configured for Cloudflare Workers deployment with CI environment logging.

## Features

- ⚡ **Vite** - Fast build tool and dev server
- 🚀 **Cloudflare Workers** - Serverless deployment platform
- 🔍 **CI Environment Logging** - Automatically displays CI environment variables during build

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build

Build the project (displays CI environment info in console):

```bash
npm run build
```

The build script will:
1. Display all CI-related environment variables (GITHUB_, CI_, RUNNER_, CLOUDFLARE_)
2. Run the Vite build process
3. Output to the `dist` folder

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

Note: You'll need to configure your Cloudflare credentials first.

## Project Structure

- `src/` - Vite application source files
- `workers-entry.js` - Cloudflare Workers entry point
- `ci-aware-build.js` - Custom build script that logs CI environment
- `wrangler.toml` - Cloudflare Workers configuration
- `dist/` - Build output directory

## CI Integration

When running in a CI environment (like GitHub Actions), the build process automatically detects and logs environment variables to help with debugging and transparency.
