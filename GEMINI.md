Directory structure:
└── mcp-youtube-transcript/
    ├── README.md
    ├── Dockerfile
    ├── GEMINI.md
    ├── LICENSE
    ├── package.json
    ├── pnpm-lock.yaml
    ├── smithery.yaml
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── .dockerignore
    ├── .npmignore
    ├── .npmrc
    ├── docs/
    │   └── KNOWN_ISSUES.md
    ├── src/
    │   ├── cli.ts
    │   ├── index.ts
    │   └── youtube/
    │       ├── error.ts
    │       ├── fetcher.ts
    │       ├── index.ts
    │       ├── types.ts
    │       └── utils.ts
    ├── tests/
    │   └── youtube.test.ts
    └── .github/
        └── workflows/
            ├── issue-manager.yml
            └── publish.yml

================================================
FILE: README.md
================================================
# MCP YouTube Transcript Server

A Model Context Protocol server that enables retrieval of transcripts from YouTube videos. This server provides direct access to video transcripts through a simple interface, making it ideal for content analysis and processing.


## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Basic Configuration](#basic-configuration)
  - [Testing](#testing)
  - [Troubleshooting and Maintenance](#troubleshooting-and-maintenance)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

✨ Key capabilities:
- Extract transcripts from YouTube videos
- Support for multiple languages
- Format text with continuous or paragraph mode
- Retrieve video titles and metadata
- Automatic paragraph segmentation
- Text normalization and HTML entity decoding
- Robust error handling
- Timestamp and overlap detection

## Getting Started

### Prerequisites

- Node.js 18 or higher

### Installation

We provide two installation methods:

#### Option 1: Manual Configuration (Recommended for Production)

1. Create or edit the Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following configuration:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": [
        "-y",
        "@gabriel3615/mcp-youtube-transcript"
      ]
    }
  }
}
```

Quick setup script for macOS:

```bash
# Create directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude

# Create or update config file
cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOL'
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": [
        "-y",
        "@gabriel3615/mcp-youtube-transcript"
      ]
    }
  }
}
EOL

```
## Usage

### Basic Configuration

To use with Claude Desktop / Cursor / cline, ensure your configuration matches:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": ["-y", "@gabriel3615/mcp-youtube-transcript"]
    }
  }
}
```

### Testing

#### With Claude App

1. Restart the Claude app after installation
2. Test with a simple command:
   ```plaintext
   https://www.youtube.com/watch?v=AJpK3YTTKZ4 Summarize this video
   ```

Example output:
![Demo](./assets/demo.png)

#### With MCP Inspector

```bash
# Clone and setup
git clone https://github.com/flying3615/mcp-youtube-transcript.git
cd mcp-youtube-transcript
npm install
npm run build

# Launch inspector
npx @modelcontextprotocol/inspector node "dist/index.js"

# Access http://localhost:6274 and try these commands:
# 1. Paste the session id to pass authentication
# 2. List Tools: clink `List Tools`
# 3. Test get_transcripts with:
#    url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ"
#    lang: "en" (optional)
#    enableParagraphs: false (optional)
```

### Troubleshooting and Maintenance

#### Checking Claude Logs

To monitor Claude's logs, you can use the following command:

```bash
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

This will display the last 20 lines of the log file and continue to show new entries as they are added.

> **Note**: Claude app automatically prefixes MCP server log files with `mcp-server-`. For example, our server's logs will be written to `mcp-server-youtube-transcript.log`.

#### Cleaning the `npx` Cache

If you encounter issues related to the `npx` cache, you can manually clean it using:

```bash
rm -rf ~/.npm/_npx
```

This will remove the cached packages and allow you to start fresh.

## API Reference

### get_transcripts

Fetches transcripts from YouTube videos.

**Parameters:**
- `url` (string, required): YouTube video URL or ID
- `lang` (string, optional): Language code (default: "en")
- `enableParagraphs` (boolean, optional): Enable paragraph mode (default: false)

**Response Format:**
```json
{
  "content": [{
    "type": "text",
    "text": "Video title and transcript content",
    "metadata": {
      "videoId": "video_id",
      "title": "video_title",
      "language": "transcript_language",
      "timestamp": "processing_time",
      "charCount": "character_count",
      "transcriptCount": "number_of_transcripts",
      "totalDuration": "total_duration",
      "paragraphsEnabled": "paragraph_mode_status"
    }
  }]
}
```

### download_video

Downloads a video from YouTube.

**Parameters:**
- `url` (string, required): YouTube video URL or ID
- `output` (string, optional): The path to save the video file (default: "video.mp4")

**Response Format:**
```json
{
  "content": [{
    "type": "text",
    "text": "Video successfully downloaded to video.mp4",
    "metadata": {
      "videoId": "video_id",
      "path": "video.mp4",
      "timestamp": "processing_time"
    }
  }]
}
```

## Development

### Project Structure

```
├── src/
│ ├── index.ts            # Server entry point
│ ├── index.ts          # YouTube transcript fetching logic
├── dist/                 # Compiled output
└── package.json
```

### Key Components

- `YouTubeTranscriptFetcher`: Core transcript fetching functionality
- `YouTubeUtils`: Text processing and utilities

### Features and Capabilities

- **Error Handling:**
  - Invalid URLs/IDs
  - Unavailable transcripts
  - Language availability
  - Network errors
  - Rate limiting

- **Text Processing:**
  - HTML entity decoding
  - Punctuation normalization
  - Space normalization
  - Smart paragraph detection

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [mcp-servers](https://github.com/modelcontextprotocol/servers)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)



================================================
FILE: Dockerfile
================================================
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Specify the default command
ENTRYPOINT ["node", "dist/index.js"]


================================================
FILE: GEMINI.md
================================================
Directory structure:
└── mcp-youtube-transcript/
    ├── README.md
    ├── Dockerfile
    ├── LICENSE
    ├── package.json
    ├── pnpm-lock.yaml
    ├── smithery.yaml
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── .dockerignore
    ├── .npmignore
    ├── .npmrc
    ├── docs/
    │   └── KNOWN_ISSUES.md
    ├── src/
    │   ├── cli.ts
    │   ├── index.ts
    │   └── youtube/
    │       ├── error.ts
    │       ├── fetcher.ts
    │       ├── index.ts
    │       ├── types.ts
    │       └── utils.ts
    ├── tests/
    │   └── youtube.test.ts
    └── .github/
        └── workflows/
            ├── issue-manager.yml
            └── publish.yml

================================================
FILE: README.md
================================================
# MCP YouTube Transcript Server

A Model Context Protocol server that enables retrieval of transcripts from YouTube videos. This server provides direct access to video transcripts through a simple interface, making it ideal for content analysis and processing.


## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Basic Configuration](#basic-configuration)
  - [Testing](#testing)
  - [Troubleshooting and Maintenance](#troubleshooting-and-maintenance)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

✨ Key capabilities:
- Extract transcripts from YouTube videos
- Support for multiple languages
- Format text with continuous or paragraph mode
- Retrieve video titles and metadata
- Automatic paragraph segmentation
- Text normalization and HTML entity decoding
- Robust error handling
- Timestamp and overlap detection

## Getting Started

### Prerequisites

- Node.js 18 or higher

### Installation

We provide two installation methods:

#### Option 1: Manual Configuration (Recommended for Production)

1. Create or edit the Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following configuration:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": [
        "-y",
        "@gabriel3615/mcp-youtube-transcript"
      ]
    }
  }
}
```

Quick setup script for macOS:

```bash
# Create directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude

# Create or update config file
cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOL'
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": [
        "-y",
        "@gabriel3615/mcp-youtube-transcript"
      ]
    }
  }
}
EOL

```
## Usage

### Basic Configuration

To use with Claude Desktop / Cursor / cline, ensure your configuration matches:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": ["-y", "@gabriel3615/mcp-youtube-transcript"]
    }
  }
}
```

### Testing

#### With Claude App

1. Restart the Claude app after installation
2. Test with a simple command:
   ```plaintext
   https://www.youtube.com/watch?v=AJpK3YTTKZ4 Summarize this video
   ```

Example output:
![Demo](./assets/demo.png)

#### With MCP Inspector

```bash
# Clone and setup
git clone https://github.com/flying3615/mcp-youtube-transcript.git
cd mcp-youtube-transcript
npm install
npm run build

# Launch inspector
npx @modelcontextprotocol/inspector node "dist/index.js"

# Access http://localhost:6274 and try these commands:
# 1. Paste the session id to pass authentication
# 2. List Tools: clink `List Tools`
# 3. Test get_transcripts with:
#    url: "https://www.youtube.com/watch?v=LCEmiRjPEtQ"
#    lang: "en" (optional)
#    enableParagraphs: false (optional)
```

### Troubleshooting and Maintenance

#### Checking Claude Logs

To monitor Claude's logs, you can use the following command:

```bash
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

This will display the last 20 lines of the log file and continue to show new entries as they are added.

> **Note**: Claude app automatically prefixes MCP server log files with `mcp-server-`. For example, our server's logs will be written to `mcp-server-youtube-transcript.log`.

#### Cleaning the `npx` Cache

If you encounter issues related to the `npx` cache, you can manually clean it using:

```bash
rm -rf ~/.npm/_npx
```

This will remove the cached packages and allow you to start fresh.

## API Reference

### get_transcripts

Fetches transcripts from YouTube videos.

**Parameters:**
- `url` (string, required): YouTube video URL or ID
- `lang` (string, optional): Language code (default: "en")
- `enableParagraphs` (boolean, optional): Enable paragraph mode (default: false)

**Response Format:**
```json
{
  "content": [{
    "type": "text",
    "text": "Video title and transcript content",
    "metadata": {
      "videoId": "video_id",
      "title": "video_title",
      "language": "transcript_language",
      "timestamp": "processing_time",
      "charCount": "character_count",
      "transcriptCount": "number_of_transcripts",
      "totalDuration": "total_duration",
      "paragraphsEnabled": "paragraph_mode_status"
    }
  }]
}
```

## Development

### Project Structure

```
├── src/
│ ├── index.ts            # Server entry point
│ ├── index.ts          # YouTube transcript fetching logic
├── dist/                 # Compiled output
└── package.json
```

### Key Components

- `YouTubeTranscriptFetcher`: Core transcript fetching functionality
- `YouTubeUtils`: Text processing and utilities

### Features and Capabilities

- **Error Handling:**
  - Invalid URLs/IDs
  - Unavailable transcripts
  - Language availability
  - Network errors
  - Rate limiting

- **Text Processing:**
  - HTML entity decoding
  - Punctuation normalization
  - Space normalization
  - Smart paragraph detection

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [mcp-servers](https://github.com/modelcontextprotocol/servers)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)



================================================
FILE: Dockerfile
================================================
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Specify the default command
ENTRYPOINT ["node", "dist/index.js"]


================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2024 Freddie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: package.json
================================================
{
  "name": "@gabriel3615/mcp-youtube-transcript",
  "version": "0.0.14",
  "description": "A server built on the Model Context Protocol (MCP) that enables direct downloading of YouTube video transcripts, supporting AI and video analysis workflows.",
  "license": "MIT",
  "author": "sinco",
  "homepage": "https://github.com/flying3615/mcp-youtube-transcript",
  "repository": {
    "type": "git",
    "url": "https://github.com/flying3615/mcp-youtube-transcript.git"
  },
  "bugs": {
    "url": "https://github.com/flying3615/mcp-youtube-transcript/issues"
  },
  "keywords": [
    "mcp",
    "youtube",
    "transcript",
    "subtitles",
    "captions",
    "video",
    "ai",
    "claude",
    "cursor",
    "cline",
    "modelcontextprotocol"
  ],
  "type": "module",
  "publishConfig": {
    "access": "public"
  },
  "main": "dist/index.js",
  "module": "dist/index.js",
  "bin": {
    "mcp-youtube-transcript": "dist/index.js",
    "youtube-transcript": "dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "rimraf dist && tsc",
    "cli": "pnpm build && node dist/cli.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "prepublishOnly": "npm run build",
    "release:patch": "npm version patch && npm publish --access public",
    "release:minor": "npm version minor && npm publish --access public",
    "release:major": "npm version major && npm publish --access public"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.7.0",
    "commander": "^14.0.0",
    "youtubei.js": "^14.0.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "@vitest/ui": "^3.2.4",
    "typescript": "^5.6.2",
    "vitest": "^3.2.4",
    "rimraf": "^6.0.1"
  }
}



================================================
FILE: pnpm-lock.yaml
================================================
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      '@modelcontextprotocol/sdk':
        specifier: 1.7.0
        version: 1.7.0
      commander:
        specifier: ^14.0.0
        version: 14.0.0
      youtubei.js:
        specifier: ^14.0.0
        version: 14.0.0
      zod:
        specifier: ^3.24.2
        version: 3.25.67
    devDependencies:
      '@types/node':
        specifier: ^20.11.24
        version: 20.19.1
      '@vitest/ui':
        specifier: ^3.2.4
        version: 3.2.4(vitest@3.2.4)
      rimraf:
        specifier: ^6.0.1
        version: 6.0.1
      typescript:
        specifier: ^5.6.2
        version: 5.8.3
      vitest:
        specifier: ^3.2.4
        version: 3.2.4(@types/node@20.19.1)(@vitest/ui@3.2.4)

packages:

  '@bufbuild/protobuf@2.5.2':
    resolution: {integrity: sha512-foZ7qr0IsUBjzWIq+SuBLfdQCpJ1j8cTuNNT4owngTHoN5KsJb8L9t65fzz7SCeSWzescoOil/0ldqiL041ABg==}

  '@esbuild/aix-ppc64@0.25.5':
    resolution: {integrity: sha512-9o3TMmpmftaCMepOdA5k/yDw8SfInyzWWTjYTFCX3kPSDJMROQTb8jg+h9Cnwnmm1vOzvxN7gIfB5V2ewpjtGA==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [aix]

  '@esbuild/android-arm64@0.25.5':
    resolution: {integrity: sha512-VGzGhj4lJO+TVGV1v8ntCZWJktV7SGCs3Pn1GRWI1SBFtRALoomm8k5E9Pmwg3HOAal2VDc2F9+PM/rEY6oIDg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm@0.25.5':
    resolution: {integrity: sha512-AdJKSPeEHgi7/ZhuIPtcQKr5RQdo6OO2IL87JkianiMYMPbCtot9fxPbrMiBADOWWm3T2si9stAiVsGbTQFkbA==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-x64@0.25.5':
    resolution: {integrity: sha512-D2GyJT1kjvO//drbRT3Hib9XPwQeWd9vZoBJn+bu/lVsOZ13cqNdDeqIF/xQ5/VmWvMduP6AmXvylO/PIc2isw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [android]

  '@esbuild/darwin-arm64@0.25.5':
    resolution: {integrity: sha512-GtaBgammVvdF7aPIgH2jxMDdivezgFu6iKpmT+48+F8Hhg5J/sfnDieg0aeG/jfSvkYQU2/pceFPDKlqZzwnfQ==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-x64@0.25.5':
    resolution: {integrity: sha512-1iT4FVL0dJ76/q1wd7XDsXrSW+oLoquptvh4CLR4kITDtqi2e/xwXwdCVH8hVHU43wgJdsq7Gxuzcs6Iq/7bxQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/freebsd-arm64@0.25.5':
    resolution: {integrity: sha512-nk4tGP3JThz4La38Uy/gzyXtpkPW8zSAmoUhK9xKKXdBCzKODMc2adkB2+8om9BDYugz+uGV7sLmpTYzvmz6Sw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.25.5':
    resolution: {integrity: sha512-PrikaNjiXdR2laW6OIjlbeuCPrPaAl0IwPIaRv+SMV8CiM8i2LqVUHFC1+8eORgWyY7yhQY+2U2fA55mBzReaw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/linux-arm64@0.25.5':
    resolution: {integrity: sha512-Z9kfb1v6ZlGbWj8EJk9T6czVEjjq2ntSYLY2cw6pAZl4oKtfgQuS4HOq41M/BcoLPzrUbNd+R4BXFyH//nHxVg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm@0.25.5':
    resolution: {integrity: sha512-cPzojwW2okgh7ZlRpcBEtsX7WBuqbLrNXqLU89GxWbNt6uIg78ET82qifUy3W6OVww6ZWobWub5oqZOVtwolfw==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-ia32@0.25.5':
    resolution: {integrity: sha512-sQ7l00M8bSv36GLV95BVAdhJ2QsIbCuCjh/uYrWiMQSUuV+LpXwIqhgJDcvMTj+VsQmqAHL2yYaasENvJ7CDKA==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-loong64@0.25.5':
    resolution: {integrity: sha512-0ur7ae16hDUC4OL5iEnDb0tZHDxYmuQyhKhsPBV8f99f6Z9KQM02g33f93rNH5A30agMS46u2HP6qTdEt6Q1kg==}
    engines: {node: '>=18'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-mips64el@0.25.5':
    resolution: {integrity: sha512-kB/66P1OsHO5zLz0i6X0RxlQ+3cu0mkxS3TKFvkb5lin6uwZ/ttOkP3Z8lfR9mJOBk14ZwZ9182SIIWFGNmqmg==}
    engines: {node: '>=18'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-ppc64@0.25.5':
    resolution: {integrity: sha512-UZCmJ7r9X2fe2D6jBmkLBMQetXPXIsZjQJCjgwpVDz+YMcS6oFR27alkgGv3Oqkv07bxdvw7fyB71/olceJhkQ==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-riscv64@0.25.5':
    resolution: {integrity: sha512-kTxwu4mLyeOlsVIFPfQo+fQJAV9mh24xL+y+Bm6ej067sYANjyEw1dNHmvoqxJUCMnkBdKpvOn0Ahql6+4VyeA==}
    engines: {node: '>=18'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-s390x@0.25.5':
    resolution: {integrity: sha512-K2dSKTKfmdh78uJ3NcWFiqyRrimfdinS5ErLSn3vluHNeHVnBAFWC8a4X5N+7FgVE1EjXS1QDZbpqZBjfrqMTQ==}
    engines: {node: '>=18'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-x64@0.25.5':
    resolution: {integrity: sha512-uhj8N2obKTE6pSZ+aMUbqq+1nXxNjZIIjCjGLfsWvVpy7gKCOL6rsY1MhRh9zLtUtAI7vpgLMK6DxjO8Qm9lJw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [linux]

  '@esbuild/netbsd-arm64@0.25.5':
    resolution: {integrity: sha512-pwHtMP9viAy1oHPvgxtOv+OkduK5ugofNTVDilIzBLpoWAM16r7b/mxBvfpuQDpRQFMfuVr5aLcn4yveGvBZvw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [netbsd]

  '@esbuild/netbsd-x64@0.25.5':
    resolution: {integrity: sha512-WOb5fKrvVTRMfWFNCroYWWklbnXH0Q5rZppjq0vQIdlsQKuw6mdSihwSo4RV/YdQ5UCKKvBy7/0ZZYLBZKIbwQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/openbsd-arm64@0.25.5':
    resolution: {integrity: sha512-7A208+uQKgTxHd0G0uqZO8UjK2R0DDb4fDmERtARjSHWxqMTye4Erz4zZafx7Di9Cv+lNHYuncAkiGFySoD+Mw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openbsd]

  '@esbuild/openbsd-x64@0.25.5':
    resolution: {integrity: sha512-G4hE405ErTWraiZ8UiSoesH8DaCsMm0Cay4fsFWOOUcz8b8rC6uCvnagr+gnioEjWn0wC+o1/TAHt+It+MpIMg==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/sunos-x64@0.25.5':
    resolution: {integrity: sha512-l+azKShMy7FxzY0Rj4RCt5VD/q8mG/e+mDivgspo+yL8zW7qEwctQ6YqKX34DTEleFAvCIUviCFX1SDZRSyMQA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/win32-arm64@0.25.5':
    resolution: {integrity: sha512-O2S7SNZzdcFG7eFKgvwUEZ2VG9D/sn/eIiz8XRZ1Q/DO5a3s76Xv0mdBzVM5j5R639lXQmPmSo0iRpHqUUrsxw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-ia32@0.25.5':
    resolution: {integrity: sha512-onOJ02pqs9h1iMJ1PQphR+VZv8qBMQ77Klcsqv9CNW2w6yLqoURLcgERAIurY6QE63bbLuqgP9ATqajFLK5AMQ==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-x64@0.25.5':
    resolution: {integrity: sha512-TXv6YnJ8ZMVdX+SXWVBo/0p8LTcrUYngpWjvm91TMjjBQii7Oz11Lw5lbDV5Y0TzuhSJHwiH4hEtC1I42mMS0g==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [win32]

  '@fastify/busboy@2.1.1':
    resolution: {integrity: sha512-vBZP4NlzfOlerQTnba4aqZoMhE/a9HY7HRqoOPaETQcSQuWEIyZMHGfVu6w9wGtGK5fED5qRs2DteVCjOH60sA==}
    engines: {node: '>=14'}

  '@isaacs/balanced-match@4.0.1':
    resolution: {integrity: sha512-yzMTt9lEb8Gv7zRioUilSglI0c0smZ9k5D65677DLWLtWJaXIS3CqcGyUFByYKlnUj6TkjLVs54fBl6+TiGQDQ==}
    engines: {node: 20 || >=22}

  '@isaacs/brace-expansion@5.0.0':
    resolution: {integrity: sha512-ZT55BDLV0yv0RBm2czMiZ+SqCGO7AvmOM3G/w2xhVPH+te0aKgFjmBvGlL1dH+ql2tgGO3MVrbb3jCKyvpgnxA==}
    engines: {node: 20 || >=22}

  '@isaacs/cliui@8.0.2':
    resolution: {integrity: sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==}
    engines: {node: '>=12'}

  '@jridgewell/sourcemap-codec@1.5.0':
    resolution: {integrity: sha512-gv3ZRaISU3fjPAgNsriBRqGWQL6quFx04YMPW/zD8XMLsU32mhCCbfbO6KZFLjvYpCZ8zyDEgqsgf+PwPaM7GQ==}

  '@modelcontextprotocol/sdk@1.7.0':
    resolution: {integrity: sha512-IYPe/FLpvF3IZrd/f5p5ffmWhMc3aEMuM2wGJASDqC2Ge7qatVCdbfPx3n/5xFeb19xN0j/911M2AaFuircsWA==}
    engines: {node: '>=18'}

  '@polka/url@1.0.0-next.29':
    resolution: {integrity: sha512-wwQAWhWSuHaag8c4q/KN/vCoeOJYshAIvMQwD4GpSb3OiZklFfvAgmj0VCBBImRpuF/aFgIRzllXlVX93Jevww==}

  '@rollup/rollup-android-arm-eabi@4.44.0':
    resolution: {integrity: sha512-xEiEE5oDW6tK4jXCAyliuntGR+amEMO7HLtdSshVuhFnKTYoeYMyXQK7pLouAJJj5KHdwdn87bfHAR2nSdNAUA==}
    cpu: [arm]
    os: [android]

  '@rollup/rollup-android-arm64@4.44.0':
    resolution: {integrity: sha512-uNSk/TgvMbskcHxXYHzqwiyBlJ/lGcv8DaUfcnNwict8ba9GTTNxfn3/FAoFZYgkaXXAdrAA+SLyKplyi349Jw==}
    cpu: [arm64]
    os: [android]

  '@rollup/rollup-darwin-arm64@4.44.0':
    resolution: {integrity: sha512-VGF3wy0Eq1gcEIkSCr8Ke03CWT+Pm2yveKLaDvq51pPpZza3JX/ClxXOCmTYYq3us5MvEuNRTaeyFThCKRQhOA==}
    cpu: [arm64]
    os: [darwin]

  '@rollup/rollup-darwin-x64@4.44.0':
    resolution: {integrity: sha512-fBkyrDhwquRvrTxSGH/qqt3/T0w5Rg0L7ZIDypvBPc1/gzjJle6acCpZ36blwuwcKD/u6oCE/sRWlUAcxLWQbQ==}
    cpu: [x64]
    os: [darwin]

  '@rollup/rollup-freebsd-arm64@4.44.0':
    resolution: {integrity: sha512-u5AZzdQJYJXByB8giQ+r4VyfZP+walV+xHWdaFx/1VxsOn6eWJhK2Vl2eElvDJFKQBo/hcYIBg/jaKS8ZmKeNQ==}
    cpu: [arm64]
    os: [freebsd]

  '@rollup/rollup-freebsd-x64@4.44.0':
    resolution: {integrity: sha512-qC0kS48c/s3EtdArkimctY7h3nHicQeEUdjJzYVJYR3ct3kWSafmn6jkNCA8InbUdge6PVx6keqjk5lVGJf99g==}
    cpu: [x64]
    os: [freebsd]

  '@rollup/rollup-linux-arm-gnueabihf@4.44.0':
    resolution: {integrity: sha512-x+e/Z9H0RAWckn4V2OZZl6EmV0L2diuX3QB0uM1r6BvhUIv6xBPL5mrAX2E3e8N8rEHVPwFfz/ETUbV4oW9+lQ==}
    cpu: [arm]
    os: [linux]

  '@rollup/rollup-linux-arm-musleabihf@4.44.0':
    resolution: {integrity: sha512-1exwiBFf4PU/8HvI8s80icyCcnAIB86MCBdst51fwFmH5dyeoWVPVgmQPcKrMtBQ0W5pAs7jBCWuRXgEpRzSCg==}
    cpu: [arm]
    os: [linux]

  '@rollup/rollup-linux-arm64-gnu@4.44.0':
    resolution: {integrity: sha512-ZTR2mxBHb4tK4wGf9b8SYg0Y6KQPjGpR4UWwTFdnmjB4qRtoATZ5dWn3KsDwGa5Z2ZBOE7K52L36J9LueKBdOQ==}
    cpu: [arm64]
    os: [linux]

  '@rollup/rollup-linux-arm64-musl@4.44.0':
    resolution: {integrity: sha512-GFWfAhVhWGd4r6UxmnKRTBwP1qmModHtd5gkraeW2G490BpFOZkFtem8yuX2NyafIP/mGpRJgTJ2PwohQkUY/Q==}
    cpu: [arm64]
    os: [linux]

  '@rollup/rollup-linux-loongarch64-gnu@4.44.0':
    resolution: {integrity: sha512-xw+FTGcov/ejdusVOqKgMGW3c4+AgqrfvzWEVXcNP6zq2ue+lsYUgJ+5Rtn/OTJf7e2CbgTFvzLW2j0YAtj0Gg==}
    cpu: [loong64]
    os: [linux]

  '@rollup/rollup-linux-powerpc64le-gnu@4.44.0':
    resolution: {integrity: sha512-bKGibTr9IdF0zr21kMvkZT4K6NV+jjRnBoVMt2uNMG0BYWm3qOVmYnXKzx7UhwrviKnmK46IKMByMgvpdQlyJQ==}
    cpu: [ppc64]
    os: [linux]

  '@rollup/rollup-linux-riscv64-gnu@4.44.0':
    resolution: {integrity: sha512-vV3cL48U5kDaKZtXrti12YRa7TyxgKAIDoYdqSIOMOFBXqFj2XbChHAtXquEn2+n78ciFgr4KIqEbydEGPxXgA==}
    cpu: [riscv64]
    os: [linux]

  '@rollup/rollup-linux-riscv64-musl@4.44.0':
    resolution: {integrity: sha512-TDKO8KlHJuvTEdfw5YYFBjhFts2TR0VpZsnLLSYmB7AaohJhM8ctDSdDnUGq77hUh4m/djRafw+9zQpkOanE2Q==}
    cpu: [riscv64]
    os: [linux]

  '@rollup/rollup-linux-s390x-gnu@4.44.0':
    resolution: {integrity: sha512-8541GEyktXaw4lvnGp9m84KENcxInhAt6vPWJ9RodsB/iGjHoMB2Pp5MVBCiKIRxrxzJhGCxmNzdu+oDQ7kwRA==}
    cpu: [s390x]
    os: [linux]

  '@rollup/rollup-linux-x64-gnu@4.44.0':
    resolution: {integrity: sha512-iUVJc3c0o8l9Sa/qlDL2Z9UP92UZZW1+EmQ4xfjTc1akr0iUFZNfxrXJ/R1T90h/ILm9iXEY6+iPrmYB3pXKjw==}
    cpu: [x64]
    os: [linux]

  '@rollup/rollup-linux-x64-musl@4.44.0':
    resolution: {integrity: sha512-PQUobbhLTQT5yz/SPg116VJBgz+XOtXt8D1ck+sfJJhuEsMj2jSej5yTdp8CvWBSceu+WW+ibVL6dm0ptG5fcA==}
    cpu: [x64]
    os: [linux]

  '@rollup/rollup-win32-arm64-msvc@4.44.0':
    resolution: {integrity: sha512-M0CpcHf8TWn+4oTxJfh7LQuTuaYeXGbk0eageVjQCKzYLsajWS/lFC94qlRqOlyC2KvRT90ZrfXULYmukeIy7w==}
    cpu: [arm64]
    os: [win32]

  '@rollup/rollup-win32-ia32-msvc@4.44.0':
    resolution: {integrity: sha512-3XJ0NQtMAXTWFW8FqZKcw3gOQwBtVWP/u8TpHP3CRPXD7Pd6s8lLdH3sHWh8vqKCyyiI8xW5ltJScQmBU9j7WA==}
    cpu: [ia32]
    os: [win32]

  '@rollup/rollup-win32-x64-msvc@4.44.0':
    resolution: {integrity: sha512-Q2Mgwt+D8hd5FIPUuPDsvPR7Bguza6yTkJxspDGkZj7tBRn2y4KSWYuIXpftFSjBra76TbKerCV7rgFPQrn+wQ==}
    cpu: [x64]
    os: [win32]

  '@types/chai@5.2.2':
    resolution: {integrity: sha512-8kB30R7Hwqf40JPiKhVzodJs2Qc1ZJ5zuT3uzw5Hq/dhNCl3G3l83jfpdI1e20BP348+fV7VIL/+FxaXkqBmWg==}

  '@types/deep-eql@4.0.2':
    resolution: {integrity: sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==}

  '@types/estree@1.0.8':
    resolution: {integrity: sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==}

  '@types/node@20.19.1':
    resolution: {integrity: sha512-jJD50LtlD2dodAEO653i3YF04NWak6jN3ky+Ri3Em3mGR39/glWiboM/IePaRbgwSfqM1TpGXfAg8ohn/4dTgA==}

  '@vitest/expect@3.2.4':
    resolution: {integrity: sha512-Io0yyORnB6sikFlt8QW5K7slY4OjqNX9jmJQ02QDda8lyM6B5oNgVWoSoKPac8/kgnCUzuHQKrSLtu/uOqqrig==}

  '@vitest/mocker@3.2.4':
    resolution: {integrity: sha512-46ryTE9RZO/rfDd7pEqFl7etuyzekzEhUbTW3BvmeO/BcCMEgq59BKhek3dXDWgAj4oMK6OZi+vRr1wPW6qjEQ==}
    peerDependencies:
      msw: ^2.4.9
      vite: ^5.0.0 || ^6.0.0 || ^7.0.0-0
    peerDependenciesMeta:
      msw:
        optional: true
      vite:
        optional: true

  '@vitest/pretty-format@3.2.4':
    resolution: {integrity: sha512-IVNZik8IVRJRTr9fxlitMKeJeXFFFN0JaB9PHPGQ8NKQbGpfjlTx9zO4RefN8gp7eqjNy8nyK3NZmBzOPeIxtA==}

  '@vitest/runner@3.2.4':
    resolution: {integrity: sha512-oukfKT9Mk41LreEW09vt45f8wx7DordoWUZMYdY/cyAk7w5TWkTRCNZYF7sX7n2wB7jyGAl74OxgwhPgKaqDMQ==}

  '@vitest/snapshot@3.2.4':
    resolution: {integrity: sha512-dEYtS7qQP2CjU27QBC5oUOxLE/v5eLkGqPE0ZKEIDGMs4vKWe7IjgLOeauHsR0D5YuuycGRO5oSRXnwnmA78fQ==}

  '@vitest/spy@3.2.4':
    resolution: {integrity: sha512-vAfasCOe6AIK70iP5UD11Ac4siNUNJ9i/9PZ3NKx07sG6sUxeag1LWdNrMWeKKYBLlzuK+Gn65Yd5nyL6ds+nw==}

  '@vitest/ui@3.2.4':
    resolution: {integrity: sha512-hGISOaP18plkzbWEcP/QvtRW1xDXF2+96HbEX6byqQhAUbiS5oH6/9JwW+QsQCIYON2bI6QZBF+2PvOmrRZ9wA==}
    peerDependencies:
      vitest: 3.2.4

  '@vitest/utils@3.2.4':
    resolution: {integrity: sha512-fB2V0JFrQSMsCo9HiSq3Ezpdv4iYaXRG1Sx8edX3MwxfyNn83mKiGzOcH+Fkxt4MHxr3y42fQi1oeAInqgX2QA==}

  accepts@2.0.0:
    resolution: {integrity: sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==}
    engines: {node: '>= 0.6'}

  acorn@8.15.0:
    resolution: {integrity: sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==}
    engines: {node: '>=0.4.0'}
    hasBin: true

  ansi-regex@5.0.1:
    resolution: {integrity: sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==}
    engines: {node: '>=8'}

  ansi-regex@6.1.0:
    resolution: {integrity: sha512-7HSX4QQb4CspciLpVFwyRe79O3xsIZDDLER21kERQ71oaPodF8jL725AgJMFAYbooIqolJoRLuM81SpeUkpkvA==}
    engines: {node: '>=12'}

  ansi-styles@4.3.0:
    resolution: {integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==}
    engines: {node: '>=8'}

  ansi-styles@6.2.1:
    resolution: {integrity: sha512-bN798gFfQX+viw3R7yrGWRqnrN2oRkEkUjjl4JNn4E8GxxbjtG3FbrEIIY3l8/hrwUwIeCZvi4QuOTP4MErVug==}
    engines: {node: '>=12'}

  assertion-error@2.0.1:
    resolution: {integrity: sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==}
    engines: {node: '>=12'}

  body-parser@2.2.0:
    resolution: {integrity: sha512-02qvAaxv8tp7fBa/mw1ga98OGm+eCbqzJOKoRt70sLmfEEi+jyBYVTDGfCL/k06/4EMk/z01gCe7HoCH/f2LTg==}
    engines: {node: '>=18'}

  bytes@3.1.2:
    resolution: {integrity: sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==}
    engines: {node: '>= 0.8'}

  cac@6.7.14:
    resolution: {integrity: sha512-b6Ilus+c3RrdDk+JhLKUAQfzzgLEPy6wcXqS7f/xe1EETvsDP6GORG7SFuOs6cID5YkqchW/LXZbX5bc8j7ZcQ==}
    engines: {node: '>=8'}

  call-bind-apply-helpers@1.0.2:
    resolution: {integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==}
    engines: {node: '>= 0.4'}

  call-bound@1.0.4:
    resolution: {integrity: sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==}
    engines: {node: '>= 0.4'}

  chai@5.2.0:
    resolution: {integrity: sha512-mCuXncKXk5iCLhfhwTc0izo0gtEmpz5CtG2y8GiOINBlMVS6v8TMRc5TaLWKS6692m9+dVVfzgeVxR5UxWHTYw==}
    engines: {node: '>=12'}

  check-error@2.1.1:
    resolution: {integrity: sha512-OAlb+T7V4Op9OwdkjmguYRqncdlx5JiofwOAUkmTF+jNdHwzTaTs4sRAGpzLF3oOz5xAyDGrPgeIDFQmDOTiJw==}
    engines: {node: '>= 16'}

  color-convert@2.0.1:
    resolution: {integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==}
    engines: {node: '>=7.0.0'}

  color-name@1.1.4:
    resolution: {integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==}

  commander@14.0.0:
    resolution: {integrity: sha512-2uM9rYjPvyq39NwLRqaiLtWHyDC1FvryJDa2ATTVims5YAS4PupsEQsDvP14FqhFr0P49CYDugi59xaxJlTXRA==}
    engines: {node: '>=20'}

  content-disposition@1.0.0:
    resolution: {integrity: sha512-Au9nRL8VNUut/XSzbQA38+M78dzP4D+eqg3gfJHMIHHYa3bg067xj1KxMUWj+VULbiZMowKngFFbKczUrNJ1mg==}
    engines: {node: '>= 0.6'}

  content-type@1.0.5:
    resolution: {integrity: sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==}
    engines: {node: '>= 0.6'}

  cookie-signature@1.2.2:
    resolution: {integrity: sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==}
    engines: {node: '>=6.6.0'}

  cookie@0.7.2:
    resolution: {integrity: sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==}
    engines: {node: '>= 0.6'}

  cors@2.8.5:
    resolution: {integrity: sha512-KIHbLJqu73RGr/hnbrO9uBeixNGuvSQjul/jdFvS/KFSIH1hWVd1ng7zOHx+YrEfInLG7q4n6GHQ9cDtxv/P6g==}
    engines: {node: '>= 0.10'}

  cross-spawn@7.0.6:
    resolution: {integrity: sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==}
    engines: {node: '>= 8'}

  debug@4.4.1:
    resolution: {integrity: sha512-KcKCqiftBJcZr++7ykoDIEwSa3XWowTfNPo92BYxjXiyYEVrUQh2aLyhxBCwww+heortUFxEJYcRzosstTEBYQ==}
    engines: {node: '>=6.0'}
    peerDependencies:
      supports-color: '*'
    peerDependenciesMeta:
      supports-color:
        optional: true

  deep-eql@5.0.2:
    resolution: {integrity: sha512-h5k/5U50IJJFpzfL6nO9jaaumfjO/f2NjK/oYB2Djzm4p9L+3T9qWpZqZ2hAbLPuuYq9wrU08WQyBTL5GbPk5Q==}
    engines: {node: '>=6'}

  depd@2.0.0:
    resolution: {integrity: sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==}
    engines: {node: '>= 0.8'}

  dunder-proto@1.0.1:
    resolution: {integrity: sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==}
    engines: {node: '>= 0.4'}

  eastasianwidth@0.2.0:
    resolution: {integrity: sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==}

  ee-first@1.1.1:
    resolution: {integrity: sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==}

  emoji-regex@8.0.0:
    resolution: {integrity: sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==}

  emoji-regex@9.2.2:
    resolution: {integrity: sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==}

  encodeurl@2.0.0:
    resolution: {integrity: sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==}
    engines: {node: '>= 0.8'}

  es-define-property@1.0.1:
    resolution: {integrity: sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==}
    engines: {node: '>= 0.4'}

  es-errors@1.3.0:
    resolution: {integrity: sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==}
    engines: {node: '>= 0.4'}

  es-module-lexer@1.7.0:
    resolution: {integrity: sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==}

  es-object-atoms@1.1.1:
    resolution: {integrity: sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==}
    engines: {node: '>= 0.4'}

  esbuild@0.25.5:
    resolution: {integrity: sha512-P8OtKZRv/5J5hhz0cUAdu/cLuPIKXpQl1R9pZtvmHWQvrAUVd0UNIPT4IB4W3rNOqVO0rlqHmCIbSwxh/c9yUQ==}
    engines: {node: '>=18'}
    hasBin: true

  escape-html@1.0.3:
    resolution: {integrity: sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==}

  estree-walker@3.0.3:
    resolution: {integrity: sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==}

  etag@1.8.1:
    resolution: {integrity: sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==}
    engines: {node: '>= 0.6'}

  eventsource-parser@3.0.2:
    resolution: {integrity: sha512-6RxOBZ/cYgd8usLwsEl+EC09Au/9BcmCKYF2/xbml6DNczf7nv0MQb+7BA2F+li6//I+28VNlQR37XfQtcAJuA==}
    engines: {node: '>=18.0.0'}

  eventsource@3.0.7:
    resolution: {integrity: sha512-CRT1WTyuQoD771GW56XEZFQ/ZoSfWid1alKGDYMmkt2yl8UXrVR4pspqWNEcqKvVIzg6PAltWjxcSSPrboA4iA==}
    engines: {node: '>=18.0.0'}

  expect-type@1.2.1:
    resolution: {integrity: sha512-/kP8CAwxzLVEeFrMm4kMmy4CCDlpipyA7MYLVrdJIkV0fYF0UaigQHRsxHiuY/GEea+bh4KSv3TIlgr+2UL6bw==}
    engines: {node: '>=12.0.0'}

  express-rate-limit@7.5.1:
    resolution: {integrity: sha512-7iN8iPMDzOMHPUYllBEsQdWVB6fPDMPqwjBaFrgr4Jgr/+okjvzAy+UHlYYL/Vs0OsOrMkwS6PJDkFlJwoxUnw==}
    engines: {node: '>= 16'}
    peerDependencies:
      express: '>= 4.11'

  express@5.1.0:
    resolution: {integrity: sha512-DT9ck5YIRU+8GYzzU5kT3eHGA5iL+1Zd0EutOmTE9Dtk+Tvuzd23VBU+ec7HPNSTxXYO55gPV/hq4pSBJDjFpA==}
    engines: {node: '>= 18'}

  fdir@6.4.6:
    resolution: {integrity: sha512-hiFoqpyZcfNm1yc4u8oWCf9A2c4D3QjCrks3zmoVKVxpQRzmPNar1hUJcBG2RQHvEVGDN+Jm81ZheVLAQMK6+w==}
    peerDependencies:
      picomatch: ^3 || ^4
    peerDependenciesMeta:
      picomatch:
        optional: true

  fflate@0.8.2:
    resolution: {integrity: sha512-cPJU47OaAoCbg0pBvzsgpTPhmhqI5eJjh/JIu8tPj5q+T7iLvW/JAYUqmE7KOB4R1ZyEhzBaIQpQpardBF5z8A==}

  finalhandler@2.1.0:
    resolution: {integrity: sha512-/t88Ty3d5JWQbWYgaOGCCYfXRwV1+be02WqYYlL6h0lEiUAMPM8o8qKGO01YIkOHzka2up08wvgYD0mDiI+q3Q==}
    engines: {node: '>= 0.8'}

  flatted@3.3.3:
    resolution: {integrity: sha512-GX+ysw4PBCz0PzosHDepZGANEuFCMLrnRTiEy9McGjmkCQYwRq4A/X786G/fjM/+OjsWSU1ZrY5qyARZmO/uwg==}

  foreground-child@3.3.1:
    resolution: {integrity: sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==}
    engines: {node: '>=14'}

  forwarded@0.2.0:
    resolution: {integrity: sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==}
    engines: {node: '>= 0.6'}

  fresh@2.0.0:
    resolution: {integrity: sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==}
    engines: {node: '>= 0.8'}

  fsevents@2.3.3:
    resolution: {integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]

  function-bind@1.1.2:
    resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}

  get-intrinsic@1.3.0:
    resolution: {integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==}
    engines: {node: '>= 0.4'}

  get-proto@1.0.1:
    resolution: {integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==}
    engines: {node: '>= 0.4'}

  glob@11.0.3:
    resolution: {integrity: sha512-2Nim7dha1KVkaiF4q6Dj+ngPPMdfvLJEOpZk/jKiUAkqKebpGAWQXAq9z1xu9HKu5lWfqw/FASuccEjyznjPaA==}
    engines: {node: 20 || >=22}
    hasBin: true

  gopd@1.2.0:
    resolution: {integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==}
    engines: {node: '>= 0.4'}

  has-symbols@1.1.0:
    resolution: {integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==}
    engines: {node: '>= 0.4'}

  hasown@2.0.2:
    resolution: {integrity: sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==}
    engines: {node: '>= 0.4'}

  http-errors@2.0.0:
    resolution: {integrity: sha512-FtwrG/euBzaEjYeRqOgly7G0qviiXoJWnvEH2Z1plBdXgbyjv34pHTSb9zoeHMyDy33+DWy5Wt9Wo+TURtOYSQ==}
    engines: {node: '>= 0.8'}

  iconv-lite@0.6.3:
    resolution: {integrity: sha512-4fCk79wshMdzMp2rH06qWrJE4iolqLhCUH+OiuIgU++RB0+94NlDL81atO7GX55uUKueo0txHNtvEyI6D7WdMw==}
    engines: {node: '>=0.10.0'}

  inherits@2.0.4:
    resolution: {integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==}

  ipaddr.js@1.9.1:
    resolution: {integrity: sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==}
    engines: {node: '>= 0.10'}

  is-fullwidth-code-point@3.0.0:
    resolution: {integrity: sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==}
    engines: {node: '>=8'}

  is-promise@4.0.0:
    resolution: {integrity: sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==}

  isexe@2.0.0:
    resolution: {integrity: sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==}

  jackspeak@4.1.1:
    resolution: {integrity: sha512-zptv57P3GpL+O0I7VdMJNBZCu+BPHVQUk55Ft8/QCJjTVxrnJHuVuX/0Bl2A6/+2oyR/ZMEuFKwmzqqZ/U5nPQ==}
    engines: {node: 20 || >=22}

  jintr@3.3.1:
    resolution: {integrity: sha512-nnOzyhf0SLpbWuZ270Omwbj5LcXUkTcZkVnK8/veJXtSZOiATM5gMZMdmzN75FmTyj+NVgrGaPdH12zIJ24oIA==}

  js-tokens@9.0.1:
    resolution: {integrity: sha512-mxa9E9ITFOt0ban3j6L5MpjwegGz6lBQmM1IJkWeBZGcMxto50+eWdjC/52xDbS2vy0k7vIMK0Fe2wfL9OQSpQ==}

  loupe@3.1.4:
    resolution: {integrity: sha512-wJzkKwJrheKtknCOKNEtDK4iqg/MxmZheEMtSTYvnzRdEYaZzmgH976nenp8WdJRdx5Vc1X/9MO0Oszl6ezeXg==}

  lru-cache@11.1.0:
    resolution: {integrity: sha512-QIXZUBJUx+2zHUdQujWejBkcD9+cs94tLn0+YL8UrCh+D5sCXZ4c7LaEH48pNwRY3MLDgqUFyhlCyjJPf1WP0A==}
    engines: {node: 20 || >=22}

  magic-string@0.30.17:
    resolution: {integrity: sha512-sNPKHvyjVf7gyjwS4xGTaW/mCnF8wnjtifKBEhxfZ7E/S8tQ0rssrwGNn6q8JH/ohItJfSQp9mBtQYuTlH5QnA==}

  math-intrinsics@1.1.0:
    resolution: {integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==}
    engines: {node: '>= 0.4'}

  media-typer@1.1.0:
    resolution: {integrity: sha512-aisnrDP4GNe06UcKFnV5bfMNPBUw4jsLGaWwWfnH3v02GnBuXX2MCVn5RbrWo0j3pczUilYblq7fQ7Nw2t5XKw==}
    engines: {node: '>= 0.8'}

  merge-descriptors@2.0.0:
    resolution: {integrity: sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==}
    engines: {node: '>=18'}

  mime-db@1.54.0:
    resolution: {integrity: sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==}
    engines: {node: '>= 0.6'}

  mime-types@3.0.1:
    resolution: {integrity: sha512-xRc4oEhT6eaBpU1XF7AjpOFD+xQmXNB5OVKwp4tqCuBpHLS/ZbBDrc07mYTDqVMg6PfxUjjNp85O6Cd2Z/5HWA==}
    engines: {node: '>= 0.6'}

  minimatch@10.0.3:
    resolution: {integrity: sha512-IPZ167aShDZZUMdRk66cyQAW3qr0WzbHkPdMYa8bzZhlHhO3jALbKdxcaak7W9FfT2rZNpQuUu4Od7ILEpXSaw==}
    engines: {node: 20 || >=22}

  minipass@7.1.2:
    resolution: {integrity: sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==}
    engines: {node: '>=16 || 14 >=14.17'}

  mrmime@2.0.1:
    resolution: {integrity: sha512-Y3wQdFg2Va6etvQ5I82yUhGdsKrcYox6p7FfL1LbK2J4V01F9TGlepTIhnK24t7koZibmg82KGglhA1XK5IsLQ==}
    engines: {node: '>=10'}

  ms@2.1.3:
    resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}

  nanoid@3.3.11:
    resolution: {integrity: sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==}
    engines: {node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1}
    hasBin: true

  negotiator@1.0.0:
    resolution: {integrity: sha512-8Ofs/AUQh8MaEcrlq5xOX0CQ9ypTF5dl78mjlMNfOK08fzpgTHQRQPBxcPlEtIw0yRpws+Zo/3r+5WRby7u3Gg==}
    engines: {node: '>= 0.6'}

  object-assign@4.1.1:
    resolution: {integrity: sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==}
    engines: {node: '>=0.10.0'}

  object-inspect@1.13.4:
    resolution: {integrity: sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==}
    engines: {node: '>= 0.4'}

  on-finished@2.4.1:
    resolution: {integrity: sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==}
    engines: {node: '>= 0.8'}

  once@1.4.0:
    resolution: {integrity: sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==}

  package-json-from-dist@1.0.1:
    resolution: {integrity: sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==}

  parseurl@1.3.3:
    resolution: {integrity: sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==}
    engines: {node: '>= 0.8'}

  path-key@3.1.1:
    resolution: {integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==}
    engines: {node: '>=8'}

  path-scurry@2.0.0:
    resolution: {integrity: sha512-ypGJsmGtdXUOeM5u93TyeIEfEhM6s+ljAhrk5vAvSx8uyY/02OvrZnA0YNGUrPXfpJMgI1ODd3nwz8Npx4O4cg==}
    engines: {node: 20 || >=22}

  path-to-regexp@8.2.0:
    resolution: {integrity: sha512-TdrF7fW9Rphjq4RjrW0Kp2AW0Ahwu9sRGTkS6bvDi0SCwZlEZYmcfDbEsTz8RVk0EHIS/Vd1bv3JhG+1xZuAyQ==}
    engines: {node: '>=16'}

  pathe@2.0.3:
    resolution: {integrity: sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==}

  pathval@2.0.0:
    resolution: {integrity: sha512-vE7JKRyES09KiunauX7nd2Q9/L7lhok4smP9RZTDeD4MVs72Dp2qNFVz39Nz5a0FVEW0BJR6C0DYrq6unoziZA==}
    engines: {node: '>= 14.16'}

  picocolors@1.1.1:
    resolution: {integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==}

  picomatch@4.0.2:
    resolution: {integrity: sha512-M7BAV6Rlcy5u+m6oPhAPFgJTzAioX/6B0DxyvDlo9l8+T3nLKbrczg2WLUyzd45L8RqfUMyGPzekbMvX2Ldkwg==}
    engines: {node: '>=12'}

  pkce-challenge@4.1.0:
    resolution: {integrity: sha512-ZBmhE1C9LcPoH9XZSdwiPtbPHZROwAnMy+kIFQVrnMCxY4Cudlz3gBOpzilgc0jOgRaiT3sIWfpMomW2ar2orQ==}
    engines: {node: '>=16.20.0'}

  postcss@8.5.6:
    resolution: {integrity: sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==}
    engines: {node: ^10 || ^12 || >=14}

  proxy-addr@2.0.7:
    resolution: {integrity: sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==}
    engines: {node: '>= 0.10'}

  qs@6.14.0:
    resolution: {integrity: sha512-YWWTjgABSKcvs/nWBi9PycY/JiPJqOD4JA6o9Sej2AtvSGarXxKC3OQSk4pAarbdQlKAh5D4FCQkJNkW+GAn3w==}
    engines: {node: '>=0.6'}

  range-parser@1.2.1:
    resolution: {integrity: sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==}
    engines: {node: '>= 0.6'}

  raw-body@3.0.0:
    resolution: {integrity: sha512-RmkhL8CAyCRPXCE28MMH0z2PNWQBNk2Q09ZdxM9IOOXwxwZbN+qbWaatPkdkWIKL2ZVDImrN/pK5HTRz2PcS4g==}
    engines: {node: '>= 0.8'}

  rimraf@6.0.1:
    resolution: {integrity: sha512-9dkvaxAsk/xNXSJzMgFqqMCuFgt2+KsOFek3TMLfo8NCPfWpBmqwyNn5Y+NX56QUYfCtsyhF3ayiboEoUmJk/A==}
    engines: {node: 20 || >=22}
    hasBin: true

  rollup@4.44.0:
    resolution: {integrity: sha512-qHcdEzLCiktQIfwBq420pn2dP+30uzqYxv9ETm91wdt2R9AFcWfjNAmje4NWlnCIQ5RMTzVf0ZyisOKqHR6RwA==}
    engines: {node: '>=18.0.0', npm: '>=8.0.0'}
    hasBin: true

  router@2.2.0:
    resolution: {integrity: sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==}
    engines: {node: '>= 18'}

  safe-buffer@5.2.1:
    resolution: {integrity: sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==}

  safer-buffer@2.1.2:
    resolution: {integrity: sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==}

  send@1.2.0:
    resolution: {integrity: sha512-uaW0WwXKpL9blXE2o0bRhoL2EGXIrZxQ2ZQ4mgcfoBxdFmQold+qWsD2jLrfZ0trjKL6vOw0j//eAwcALFjKSw==}
    engines: {node: '>= 18'}

  serve-static@2.2.0:
    resolution: {integrity: sha512-61g9pCh0Vnh7IutZjtLGGpTA355+OPn2TyDv/6ivP2h/AdAVX9azsoxmg2/M6nZeQZNYBEwIcsne1mJd9oQItQ==}
    engines: {node: '>= 18'}

  setprototypeof@1.2.0:
    resolution: {integrity: sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==}

  shebang-command@2.0.0:
    resolution: {integrity: sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==}
    engines: {node: '>=8'}

  shebang-regex@3.0.0:
    resolution: {integrity: sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==}
    engines: {node: '>=8'}

  side-channel-list@1.0.0:
    resolution: {integrity: sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==}
    engines: {node: '>= 0.4'}

  side-channel-map@1.0.1:
    resolution: {integrity: sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==}
    engines: {node: '>= 0.4'}

  side-channel-weakmap@1.0.2:
    resolution: {integrity: sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==}
    engines: {node: '>= 0.4'}

  side-channel@1.1.0:
    resolution: {integrity: sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==}
    engines: {node: '>= 0.4'}

  siginfo@2.0.0:
    resolution: {integrity: sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==}

  signal-exit@4.1.0:
    resolution: {integrity: sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==}
    engines: {node: '>=14'}

  sirv@3.0.1:
    resolution: {integrity: sha512-FoqMu0NCGBLCcAkS1qA+XJIQTR6/JHfQXl+uGteNCQ76T91DMUjPa9xfmeqMY3z80nLSg9yQmNjK0Px6RWsH/A==}
    engines: {node: '>=18'}

  source-map-js@1.2.1:
    resolution: {integrity: sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==}
    engines: {node: '>=0.10.0'}

  stackback@0.0.2:
    resolution: {integrity: sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==}

  statuses@2.0.1:
    resolution: {integrity: sha512-RwNA9Z/7PrK06rYLIzFMlaF+l73iwpzsqRIFgbMLbTcLD6cOao82TaWefPXQvB2fOC4AjuYSEndS7N/mTCbkdQ==}
    engines: {node: '>= 0.8'}

  statuses@2.0.2:
    resolution: {integrity: sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==}
    engines: {node: '>= 0.8'}

  std-env@3.9.0:
    resolution: {integrity: sha512-UGvjygr6F6tpH7o2qyqR6QYpwraIjKSdtzyBdyytFOHmPZY917kwdwLG0RbOjWOnKmnm3PeHjaoLLMie7kPLQw==}

  string-width@4.2.3:
    resolution: {integrity: sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==}
    engines: {node: '>=8'}

  string-width@5.1.2:
    resolution: {integrity: sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==}
    engines: {node: '>=12'}

  strip-ansi@6.0.1:
    resolution: {integrity: sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==}
    engines: {node: '>=8'}

  strip-ansi@7.1.0:
    resolution: {integrity: sha512-iq6eVVI64nQQTRYq2KtEg2d2uU7LElhTJwsH4YzIHZshxlgZms/wIc4VoDQTlG/IvVIrBKG06CrZnp0qv7hkcQ==}
    engines: {node: '>=12'}

  strip-literal@3.0.0:
    resolution: {integrity: sha512-TcccoMhJOM3OebGhSBEmp3UZ2SfDMZUEBdRA/9ynfLi8yYajyWX3JiXArcJt4Umh4vISpspkQIY8ZZoCqjbviA==}

  tinybench@2.9.0:
    resolution: {integrity: sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==}

  tinyexec@0.3.2:
    resolution: {integrity: sha512-KQQR9yN7R5+OSwaK0XQoj22pwHoTlgYqmUscPYoknOoWCWfj/5/ABTMRi69FrKU5ffPVh5QcFikpWJI/P1ocHA==}

  tinyglobby@0.2.14:
    resolution: {integrity: sha512-tX5e7OM1HnYr2+a2C/4V0htOcSQcoSTH9KgJnVvNm5zm/cyEWKJ7j7YutsH9CxMdtOkkLFy2AHrMci9IM8IPZQ==}
    engines: {node: '>=12.0.0'}

  tinypool@1.1.1:
    resolution: {integrity: sha512-Zba82s87IFq9A9XmjiX5uZA/ARWDrB03OHlq+Vw1fSdt0I+4/Kutwy8BP4Y/y/aORMo61FQ0vIb5j44vSo5Pkg==}
    engines: {node: ^18.0.0 || >=20.0.0}

  tinyrainbow@2.0.0:
    resolution: {integrity: sha512-op4nsTR47R6p0vMUUoYl/a+ljLFVtlfaXkLQmqfLR1qHma1h/ysYk4hEXZ880bf2CYgTskvTa/e196Vd5dDQXw==}
    engines: {node: '>=14.0.0'}

  tinyspy@4.0.3:
    resolution: {integrity: sha512-t2T/WLB2WRgZ9EpE4jgPJ9w+i66UZfDc8wHh0xrwiRNN+UwH98GIJkTeZqX9rg0i0ptwzqW+uYeIF0T4F8LR7A==}
    engines: {node: '>=14.0.0'}

  toidentifier@1.0.1:
    resolution: {integrity: sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==}
    engines: {node: '>=0.6'}

  totalist@3.0.1:
    resolution: {integrity: sha512-sf4i37nQ2LBx4m3wB74y+ubopq6W/dIzXg0FDGjsYnZHVa1Da8FH853wlL2gtUhg+xJXjfk3kUZS3BRoQeoQBQ==}
    engines: {node: '>=6'}

  tslib@2.8.1:
    resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

  type-is@2.0.1:
    resolution: {integrity: sha512-OZs6gsjF4vMp32qrCbiVSkrFmXtG/AZhY3t0iAMrMBiAZyV9oALtXO8hsrHbMXF9x6L3grlFuwW2oAz7cav+Gw==}
    engines: {node: '>= 0.6'}

  typescript@5.8.3:
    resolution: {integrity: sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==}
    engines: {node: '>=14.17'}
    hasBin: true

  undici-types@6.21.0:
    resolution: {integrity: sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==}

  undici@5.29.0:
    resolution: {integrity: sha512-raqeBD6NQK4SkWhQzeYKd1KmIG6dllBOTt55Rmkt4HtI9mwdWtJljnrXjAFUBLTSN67HWrOIZ3EPF4kjUw80Bg==}
    engines: {node: '>=14.0'}

  unpipe@1.0.0:
    resolution: {integrity: sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==}
    engines: {node: '>= 0.8'}

  vary@1.1.2:
    resolution: {integrity: sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==}
    engines: {node: '>= 0.8'}

  vite-node@3.2.4:
    resolution: {integrity: sha512-EbKSKh+bh1E1IFxeO0pg1n4dvoOTt0UDiXMd/qn++r98+jPO1xtJilvXldeuQ8giIB5IkpjCgMleHMNEsGH6pg==}
    engines: {node: ^18.0.0 || ^20.0.0 || >=22.0.0}
    hasBin: true

  vite@6.3.5:
    resolution: {integrity: sha512-cZn6NDFE7wdTpINgs++ZJ4N49W2vRp8LCKrn3Ob1kYNtOo21vfDoaV5GzBfLU4MovSAB8uNRm4jgzVQZ+mBzPQ==}
    engines: {node: ^18.0.0 || ^20.0.0 || >=22.0.0}
    hasBin: true
    peerDependencies:
      '@types/node': ^18.0.0 || ^20.0.0 || >=22.0.0
      jiti: '>=1.21.0'
      less: '*'
      lightningcss: ^1.21.0
      sass: '*'
      sass-embedded: '*'
      stylus: '*'
      sugarss: '*'
      terser: ^5.16.0
      tsx: ^4.8.1
      yaml: ^2.4.2
    peerDependenciesMeta:
      '@types/node':
        optional: true
      jiti:
        optional: true
      less:
        optional: true
      lightningcss:
        optional: true
      sass:
        optional: true
      sass-embedded:
        optional: true
      stylus:
        optional: true
      sugarss:
        optional: true
      terser:
        optional: true
      tsx:
        optional: true
      yaml:
        optional: true

  vitest@3.2.4:
    resolution: {integrity: sha512-LUCP5ev3GURDysTWiP47wRRUpLKMOfPh+yKTx3kVIEiu5KOMeqzpnYNsKyOoVrULivR8tLcks4+lga33Whn90A==}
    engines: {node: ^18.0.0 || ^20.0.0 || >=22.0.0}
    hasBin: true
    peerDependencies:
      '@edge-runtime/vm': '*'
      '@types/debug': ^4.1.12
      '@types/node': ^18.0.0 || ^20.0.0 || >=22.0.0
      '@vitest/browser': 3.2.4
      '@vitest/ui': 3.2.4
      happy-dom: '*'
      jsdom: '*'
    peerDependenciesMeta:
      '@edge-runtime/vm':
        optional: true
      '@types/debug':
        optional: true
      '@types/node':
        optional: true
      '@vitest/browser':
        optional: true
      '@vitest/ui':
        optional: true
      happy-dom:
        optional: true
      jsdom:
        optional: true

  which@2.0.2:
    resolution: {integrity: sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==}
    engines: {node: '>= 8'}
    hasBin: true

  why-is-node-running@2.3.0:
    resolution: {integrity: sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==}
    engines: {node: '>=8'}
    hasBin: true

  wrap-ansi@7.0.0:
    resolution: {integrity: sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==}
    engines: {node: '>=10'}

  wrap-ansi@8.1.0:
    resolution: {integrity: sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==}
    engines: {node: '>=12'}

  wrappy@1.0.2:
    resolution: {integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==}

  youtubei.js@14.0.0:
    resolution: {integrity: sha512-KAFttOw+9fwwBUvBc1T7KzMNBLczDOuN/dfote8BA9CABxgx8MPgV+vZWlowdDB6DnHjSUYppv+xvJ4VNBLK9A==}

  zod-to-json-schema@3.24.5:
    resolution: {integrity: sha512-/AuWwMP+YqiPbsJx5D6TfgRTc4kTLjsh5SOcd4bLsfUg2RcEXrFMJl1DGgdHy2aCfsIA/cr/1JM0xcB2GZji8g==}
    peerDependencies:
      zod: ^3.24.1

  zod@3.25.67:
    resolution: {integrity: sha512-idA2YXwpCdqUSKRCACDE6ItZD9TZzy3OZMtpfLoh6oPR47lipysRrJfjzMqFxQ3uJuUPyUeWe1r9vLH33xO/Qw==}

snapshots:

  '@bufbuild/protobuf@2.5.2': {}

  '@esbuild/aix-ppc64@0.25.5':
    optional: true

  '@esbuild/android-arm64@0.25.5':
    optional: true

  '@esbuild/android-arm@0.25.5':
    optional: true

  '@esbuild/android-x64@0.25.5':
    optional: true

  '@esbuild/darwin-arm64@0.25.5':
    optional: true

  '@esbuild/darwin-x64@0.25.5':
    optional: true

  '@esbuild/freebsd-arm64@0.25.5':
    optional: true

  '@esbuild/freebsd-x64@0.25.5':
    optional: true

  '@esbuild/linux-arm64@0.25.5':
    optional: true

  '@esbuild/linux-arm@0.25.5':
    optional: true

  '@esbuild/linux-ia32@0.25.5':
    optional: true

  '@esbuild/linux-loong64@0.25.5':
    optional: true

  '@esbuild/linux-mips64el@0.25.5':
    optional: true

  '@esbuild/linux-ppc64@0.25.5':
    optional: true

  '@esbuild/linux-riscv64@0.25.5':
    optional: true

  '@esbuild/linux-s390x@0.25.5':
    optional: true

  '@esbuild/linux-x64@0.25.5':
    optional: true

  '@esbuild/netbsd-arm64@0.25.5':
    optional: true

  '@esbuild/netbsd-x64@0.25.5':
    optional: true

  '@esbuild/openbsd-arm64@0.25.5':
    optional: true

  '@esbuild/openbsd-x64@0.25.5':
    optional: true

  '@esbuild/sunos-x64@0.25.5':
    optional: true

  '@esbuild/win32-arm64@0.25.5':
    optional: true

  '@esbuild/win32-ia32@0.25.5':
    optional: true

  '@esbuild/win32-x64@0.25.5':
    optional: true

  '@fastify/busboy@2.1.1': {}

  '@isaacs/balanced-match@4.0.1': {}

  '@isaacs/brace-expansion@5.0.0':
    dependencies:
      '@isaacs/balanced-match': 4.0.1

  '@isaacs/cliui@8.0.2':
    dependencies:
      string-width: 5.1.2
      string-width-cjs: string-width@4.2.3
      strip-ansi: 7.1.0
      strip-ansi-cjs: strip-ansi@6.0.1
      wrap-ansi: 8.1.0
      wrap-ansi-cjs: wrap-ansi@7.0.0

  '@jridgewell/sourcemap-codec@1.5.0': {}

  '@modelcontextprotocol/sdk@1.7.0':
    dependencies:
      content-type: 1.0.5
      cors: 2.8.5
      eventsource: 3.0.7
      express: 5.1.0
      express-rate-limit: 7.5.1(express@5.1.0)
      pkce-challenge: 4.1.0
      raw-body: 3.0.0
      zod: 3.25.67
      zod-to-json-schema: 3.24.5(zod@3.25.67)
    transitivePeerDependencies:
      - supports-color

  '@polka/url@1.0.0-next.29': {}

  '@rollup/rollup-android-arm-eabi@4.44.0':
    optional: true

  '@rollup/rollup-android-arm64@4.44.0':
    optional: true

  '@rollup/rollup-darwin-arm64@4.44.0':
    optional: true

  '@rollup/rollup-darwin-x64@4.44.0':
    optional: true

  '@rollup/rollup-freebsd-arm64@4.44.0':
    optional: true

  '@rollup/rollup-freebsd-x64@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm-gnueabihf@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm-musleabihf@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm64-musl@4.44.0':
    optional: true

  '@rollup/rollup-linux-loongarch64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-powerpc64le-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-riscv64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-riscv64-musl@4.44.0':
    optional: true

  '@rollup/rollup-linux-s390x-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-x64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-x64-musl@4.44.0':
    optional: true

  '@rollup/rollup-win32-arm64-msvc@4.44.0':
    optional: true

  '@rollup/rollup-win32-ia32-msvc@4.44.0':
    optional: true

  '@rollup/rollup-win32-x64-msvc@4.44.0':
    optional: true

  '@types/chai@5.2.2':
    dependencies:
      '@types/deep-eql': 4.0.2

  '@types/deep-eql@4.0.2': {}

  '@types/estree@1.0.8': {}

  '@types/node@20.19.1':
    dependencies:
      undici-types: 6.21.0

  '@vitest/expect@3.2.4':
    dependencies:
      '@types/chai': 5.2.2
      '@vitest/spy': 3.2.4
      '@vitest/utils': 3.2.4
      chai: 5.2.0
      tinyrainbow: 2.0.0

  '@vitest/mocker@3.2.4(vite@6.3.5(@types/node@20.19.1))':
    dependencies:
      '@vitest/spy': 3.2.4
      estree-walker: 3.0.3
      magic-string: 0.30.17
    optionalDependencies:
      vite: 6.3.5(@types/node@20.19.1)

  '@vitest/pretty-format@3.2.4':
    dependencies:
      tinyrainbow: 2.0.0

  '@vitest/runner@3.2.4':
    dependencies:
      '@vitest/utils': 3.2.4
      pathe: 2.0.3
      strip-literal: 3.0.0

  '@vitest/snapshot@3.2.4':
    dependencies:
      '@vitest/pretty-format': 3.2.4
      magic-string: 0.30.17
      pathe: 2.0.3

  '@vitest/spy@3.2.4':
    dependencies:
      tinyspy: 4.0.3

  '@vitest/ui@3.2.4(vitest@3.2.4)':
    dependencies:
      '@vitest/utils': 3.2.4
      fflate: 0.8.2
      flatted: 3.3.3
      pathe: 2.0.3
      sirv: 3.0.1
      tinyglobby: 0.2.14
      tinyrainbow: 2.0.0
      vitest: 3.2.4(@types/node@20.19.1)(@vitest/ui@3.2.4)

  '@vitest/utils@3.2.4':
    dependencies:
      '@vitest/pretty-format': 3.2.4
      loupe: 3.1.4
      tinyrainbow: 2.0.0

  accepts@2.0.0:
    dependencies:
      mime-types: 3.0.1
      negotiator: 1.0.0

  acorn@8.15.0: {}

  ansi-regex@5.0.1: {}

  ansi-regex@6.1.0: {}

  ansi-styles@4.3.0:
    dependencies:
      color-convert: 2.0.1

  ansi-styles@6.2.1: {}

  assertion-error@2.0.1: {}

  body-parser@2.2.0:
    dependencies:
      bytes: 3.1.2
      content-type: 1.0.5
      debug: 4.4.1
      http-errors: 2.0.0
      iconv-lite: 0.6.3
      on-finished: 2.4.1
      qs: 6.14.0
      raw-body: 3.0.0
      type-is: 2.0.1
    transitivePeerDependencies:
      - supports-color

  bytes@3.1.2: {}

  cac@6.7.14: {}

  call-bind-apply-helpers@1.0.2:
    dependencies:
      es-errors: 1.3.0
      function-bind: 1.1.2

  call-bound@1.0.4:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      get-intrinsic: 1.3.0

  chai@5.2.0:
    dependencies:
      assertion-error: 2.0.1
      check-error: 2.1.1
      deep-eql: 5.0.2
      loupe: 3.1.4
      pathval: 2.0.0

  check-error@2.1.1: {}

  color-convert@2.0.1:
    dependencies:
      color-name: 1.1.4

  color-name@1.1.4: {}

  commander@14.0.0: {}

  content-disposition@1.0.0:
    dependencies:
      safe-buffer: 5.2.1

  content-type@1.0.5: {}

  cookie-signature@1.2.2: {}

  cookie@0.7.2: {}

  cors@2.8.5:
    dependencies:
      object-assign: 4.1.1
      vary: 1.1.2

  cross-spawn@7.0.6:
    dependencies:
      path-key: 3.1.1
      shebang-command: 2.0.0
      which: 2.0.2

  debug@4.4.1:
    dependencies:
      ms: 2.1.3

  deep-eql@5.0.2: {}

  depd@2.0.0: {}

  dunder-proto@1.0.1:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-errors: 1.3.0
      gopd: 1.2.0

  eastasianwidth@0.2.0: {}

  ee-first@1.1.1: {}

  emoji-regex@8.0.0: {}

  emoji-regex@9.2.2: {}

  encodeurl@2.0.0: {}

  es-define-property@1.0.1: {}

  es-errors@1.3.0: {}

  es-module-lexer@1.7.0: {}

  es-object-atoms@1.1.1:
    dependencies:
      es-errors: 1.3.0

  esbuild@0.25.5:
    optionalDependencies:
      '@esbuild/aix-ppc64': 0.25.5
      '@esbuild/android-arm': 0.25.5
      '@esbuild/android-arm64': 0.25.5
      '@esbuild/android-x64': 0.25.5
      '@esbuild/darwin-arm64': 0.25.5
      '@esbuild/darwin-x64': 0.25.5
      '@esbuild/freebsd-arm64': 0.25.5
      '@esbuild/freebsd-x64': 0.25.5
      '@esbuild/linux-arm': 0.25.5
      '@esbuild/linux-arm64': 0.25.5
      '@esbuild/linux-ia32': 0.25.5
      '@esbuild/linux-loong64': 0.25.5
      '@esbuild/linux-mips64el': 0.25.5
      '@esbuild/linux-ppc64': 0.25.5
      '@esbuild/linux-riscv64': 0.25.5
      '@esbuild/linux-s390x': 0.25.5
      '@esbuild/linux-x64': 0.25.5
      '@esbuild/netbsd-arm64': 0.25.5
      '@esbuild/netbsd-x64': 0.25.5
      '@esbuild/openbsd-arm64': 0.25.5
      '@esbuild/openbsd-x64': 0.25.5
      '@esbuild/sunos-x64': 0.25.5
      '@esbuild/win32-arm64': 0.25.5
      '@esbuild/win32-ia32': 0.25.5
      '@esbuild/win32-x64': 0.25.5

  escape-html@1.0.3: {}

  estree-walker@3.0.3:
    dependencies:
      '@types/estree': 1.0.8

  etag@1.8.1: {}

  eventsource-parser@3.0.2: {}

  eventsource@3.0.7:
    dependencies:
      eventsource-parser: 3.0.2

  expect-type@1.2.1: {}

  express-rate-limit@7.5.1(express@5.1.0):
    dependencies:
      express: 5.1.0

  express@5.1.0:
    dependencies:
      accepts: 2.0.0
      body-parser: 2.2.0
      content-disposition: 1.0.0
      content-type: 1.0.5
      cookie: 0.7.2
      cookie-signature: 1.2.2
      debug: 4.4.1
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      finalhandler: 2.1.0
      fresh: 2.0.0
      http-errors: 2.0.0
      merge-descriptors: 2.0.0
      mime-types: 3.0.1
      on-finished: 2.4.1
      once: 1.4.0
      parseurl: 1.3.3
      proxy-addr: 2.0.7
      qs: 6.14.0
      range-parser: 1.2.1
      router: 2.2.0
      send: 1.2.0
      serve-static: 2.2.0
      statuses: 2.0.2
      type-is: 2.0.1
      vary: 1.1.2
    transitivePeerDependencies:
      - supports-color

  fdir@6.4.6(picomatch@4.0.2):
    optionalDependencies:
      picomatch: 4.0.2

  fflate@0.8.2: {}

  finalhandler@2.1.0:
    dependencies:
      debug: 4.4.1
      encodeurl: 2.0.0
      escape-html: 1.0.3
      on-finished: 2.4.1
      parseurl: 1.3.3
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  flatted@3.3.3: {}

  foreground-child@3.3.1:
    dependencies:
      cross-spawn: 7.0.6
      signal-exit: 4.1.0

  forwarded@0.2.0: {}

  fresh@2.0.0: {}

  fsevents@2.3.3:
    optional: true

  function-bind@1.1.2: {}

  get-intrinsic@1.3.0:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-define-property: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      function-bind: 1.1.2
      get-proto: 1.0.1
      gopd: 1.2.0
      has-symbols: 1.1.0
      hasown: 2.0.2
      math-intrinsics: 1.1.0

  get-proto@1.0.1:
    dependencies:
      dunder-proto: 1.0.1
      es-object-atoms: 1.1.1

  glob@11.0.3:
    dependencies:
      foreground-child: 3.3.1
      jackspeak: 4.1.1
      minimatch: 10.0.3
      minipass: 7.1.2
      package-json-from-dist: 1.0.1
      path-scurry: 2.0.0

  gopd@1.2.0: {}

  has-symbols@1.1.0: {}

  hasown@2.0.2:
    dependencies:
      function-bind: 1.1.2

  http-errors@2.0.0:
    dependencies:
      depd: 2.0.0
      inherits: 2.0.4
      setprototypeof: 1.2.0
      statuses: 2.0.1
      toidentifier: 1.0.1

  iconv-lite@0.6.3:
    dependencies:
      safer-buffer: 2.1.2

  inherits@2.0.4: {}

  ipaddr.js@1.9.1: {}

  is-fullwidth-code-point@3.0.0: {}

  is-promise@4.0.0: {}

  isexe@2.0.0: {}

  jackspeak@4.1.1:
    dependencies:
      '@isaacs/cliui': 8.0.2

  jintr@3.3.1:
    dependencies:
      acorn: 8.15.0

  js-tokens@9.0.1: {}

  loupe@3.1.4: {}

  lru-cache@11.1.0: {}

  magic-string@0.30.17:
    dependencies:
      '@jridgewell/sourcemap-codec': 1.5.0

  math-intrinsics@1.1.0: {}

  media-typer@1.1.0: {}

  merge-descriptors@2.0.0: {}

  mime-db@1.54.0: {}

  mime-types@3.0.1:
    dependencies:
      mime-db: 1.54.0

  minimatch@10.0.3:
    dependencies:
      '@isaacs/brace-expansion': 5.0.0

  minipass@7.1.2: {}

  mrmime@2.0.1: {}

  ms@2.1.3: {}

  nanoid@3.3.11: {}

  negotiator@1.0.0: {}

  object-assign@4.1.1: {}

  object-inspect@1.13.4: {}

  on-finished@2.4.1:
    dependencies:
      ee-first: 1.1.1

  once@1.4.0:
    dependencies:
      wrappy: 1.0.2

  package-json-from-dist@1.0.1: {}

  parseurl@1.3.3: {}

  path-key@3.1.1: {}

  path-scurry@2.0.0:
    dependencies:
      lru-cache: 11.1.0
      minipass: 7.1.2

  path-to-regexp@8.2.0: {}

  pathe@2.0.3: {}

  pathval@2.0.0: {}

  picocolors@1.1.1: {}

  picomatch@4.0.2: {}

  pkce-challenge@4.1.0: {}

  postcss@8.5.6:
    dependencies:
      nanoid: 3.3.11
      picocolors: 1.1.1
      source-map-js: 1.2.1

  proxy-addr@2.0.7:
    dependencies:
      forwarded: 0.2.0
      ipaddr.js: 1.9.1

  qs@6.14.0:
    dependencies:
      side-channel: 1.1.0

  range-parser@1.2.1: {}

  raw-body@3.0.0:
    dependencies:
      bytes: 3.1.2
      http-errors: 2.0.0
      iconv-lite: 0.6.3
      unpipe: 1.0.0

  rimraf@6.0.1:
    dependencies:
      glob: 11.0.3
      package-json-from-dist: 1.0.1

  rollup@4.44.0:
    dependencies:
      '@types/estree': 1.0.8
    optionalDependencies:
      '@rollup/rollup-android-arm-eabi': 4.44.0
      '@rollup/rollup-android-arm64': 4.44.0
      '@rollup/rollup-darwin-arm64': 4.44.0
      '@rollup/rollup-darwin-x64': 4.44.0
      '@rollup/rollup-freebsd-arm64': 4.44.0
      '@rollup/rollup-freebsd-x64': 4.44.0
      '@rollup/rollup-linux-arm-gnueabihf': 4.44.0
      '@rollup/rollup-linux-arm-musleabihf': 4.44.0
      '@rollup/rollup-linux-arm64-gnu': 4.44.0
      '@rollup/rollup-linux-arm64-musl': 4.44.0
      '@rollup/rollup-linux-loongarch64-gnu': 4.44.0
      '@rollup/rollup-linux-powerpc64le-gnu': 4.44.0
      '@rollup/rollup-linux-riscv64-gnu': 4.44.0
      '@rollup/rollup-linux-riscv64-musl': 4.44.0
      '@rollup/rollup-linux-s390x-gnu': 4.44.0
      '@rollup/rollup-linux-x64-gnu': 4.44.0
      '@rollup/rollup-linux-x64-musl': 4.44.0
      '@rollup/rollup-win32-arm64-msvc': 4.44.0
      '@rollup/rollup-win32-ia32-msvc': 4.44.0
      '@rollup/rollup-win32-x64-msvc': 4.44.0
      fsevents: 2.3.3

  router@2.2.0:
    dependencies:
      debug: 4.4.1
      depd: 2.0.0
      is-promise: 4.0.0
      parseurl: 1.3.3
      path-to-regexp: 8.2.0
    transitivePeerDependencies:
      - supports-color

  safe-buffer@5.2.1: {}

  safer-buffer@2.1.2: {}

  send@1.2.0:
    dependencies:
      debug: 4.4.1
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      fresh: 2.0.0
      http-errors: 2.0.0
      mime-types: 3.0.1
      ms: 2.1.3
      on-finished: 2.4.1
      range-parser: 1.2.1
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  serve-static@2.2.0:
    dependencies:
      encodeurl: 2.0.0
      escape-html: 1.0.3
      parseurl: 1.3.3
      send: 1.2.0
    transitivePeerDependencies:
      - supports-color

  setprototypeof@1.2.0: {}

  shebang-command@2.0.0:
    dependencies:
      shebang-regex: 3.0.0

  shebang-regex@3.0.0: {}

  side-channel-list@1.0.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4

  side-channel-map@1.0.1:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4

  side-channel-weakmap@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4
      side-channel-map: 1.0.1

  side-channel@1.1.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4
      side-channel-list: 1.0.0
      side-channel-map: 1.0.1
      side-channel-weakmap: 1.0.2

  siginfo@2.0.0: {}

  signal-exit@4.1.0: {}

  sirv@3.0.1:
    dependencies:
      '@polka/url': 1.0.0-next.29
      mrmime: 2.0.1
      totalist: 3.0.1

  source-map-js@1.2.1: {}

  stackback@0.0.2: {}

  statuses@2.0.1: {}

  statuses@2.0.2: {}

  std-env@3.9.0: {}

  string-width@4.2.3:
    dependencies:
      emoji-regex: 8.0.0
      is-fullwidth-code-point: 3.0.0
      strip-ansi: 6.0.1

  string-width@5.1.2:
    dependencies:
      eastasianwidth: 0.2.0
      emoji-regex: 9.2.2
      strip-ansi: 7.1.0

  strip-ansi@6.0.1:
    dependencies:
      ansi-regex: 5.0.1

  strip-ansi@7.1.0:
    dependencies:
      ansi-regex: 6.1.0

  strip-literal@3.0.0:
    dependencies:
      js-tokens: 9.0.1

  tinybench@2.9.0: {}

  tinyexec@0.3.2: {}

  tinyglobby@0.2.14:
    dependencies:
      fdir: 6.4.6(picomatch@4.0.2)
      picomatch: 4.0.2

  tinypool@1.1.1: {}

  tinyrainbow@2.0.0: {}

  tinyspy@4.0.3: {}

  toidentifier@1.0.1: {}

  totalist@3.0.1: {}

  tslib@2.8.1: {}

  type-is@2.0.1:
    dependencies:
      content-type: 1.0.5
      media-typer: 1.1.0
      mime-types: 3.0.1

  typescript@5.8.3: {}

  undici-types@6.21.0: {}

  undici@5.29.0:
    dependencies:
      '@fastify/busboy': 2.1.1

  unpipe@1.0.0: {}

  vary@1.1.2: {}

  vite-node@3.2.4(@types/node@20.19.1):
    dependencies:
      cac: 6.7.14
      debug: 4.4.1
      es-module-lexer: 1.7.0
      pathe: 2.0.3
      vite: 6.3.5(@types/node@20.19.1)
    transitivePeerDependencies:
      - '@types/node'
      - jiti
      - less
      - lightningcss
      - sass
      - sass-embedded
      - stylus
      - sugarss
      - supports-color
      - terser
      - tsx
      - yaml

  vite@6.3.5(@types/node@20.19.1):
    dependencies:
      esbuild: 0.25.5
      fdir: 6.4.6(picomatch@4.0.2)
      picomatch: 4.0.2
      postcss: 8.5.6
      rollup: 4.44.0
      tinyglobby: 0.2.14
    optionalDependencies:
      '@types/node': 20.19.1
      fsevents: 2.3.3

  vitest@3.2.4(@types/node@20.19.1)(@vitest/ui@3.2.4):
    dependencies:
      '@types/chai': 5.2.2
      '@vitest/expect': 3.2.4
      '@vitest/mocker': 3.2.4(vite@6.3.5(@types/node@20.19.1))
      '@vitest/pretty-format': 3.2.4
      '@vitest/runner': 3.2.4
      '@vitest/snapshot': 3.2.4
      '@vitest/spy': 3.2.4
      '@vitest/utils': 3.2.4
      chai: 5.2.0
      debug: 4.4.1
      expect-type: 1.2.1
      magic-string: 0.30.17
      pathe: 2.0.3
      picomatch: 4.0.2
      std-env: 3.9.0
      tinybench: 2.9.0
      tinyexec: 0.3.2
      tinyglobby: 0.2.14
      tinypool: 1.1.1
      tinyrainbow: 2.0.0
      vite: 6.3.5(@types/node@20.19.1)
      vite-node: 3.2.4(@types/node@20.19.1)
      why-is-node-running: 2.3.0
    optionalDependencies:
      '@types/node': 20.19.1
      '@vitest/ui': 3.2.4(vitest@3.2.4)
    transitivePeerDependencies:
      - jiti
      - less
      - lightningcss
      - msw
      - sass
      - sass-embedded
      - stylus
      - sugarss
      - supports-color
      - terser
      - tsx
      - yaml

  which@2.0.2:
    dependencies:
      isexe: 2.0.0

  why-is-node-running@2.3.0:
    dependencies:
      siginfo: 2.0.0
      stackback: 0.0.2

  wrap-ansi@7.0.0:
    dependencies:
      ansi-styles: 4.3.0
      string-width: 4.2.3
      strip-ansi: 6.0.1

  wrap-ansi@8.1.0:
    dependencies:
      ansi-styles: 6.2.1
      string-width: 5.1.2
      strip-ansi: 7.1.0

  wrappy@1.0.2: {}

  youtubei.js@14.0.0:
    dependencies:
      '@bufbuild/protobuf': 2.5.2
      jintr: 3.3.1
      tslib: 2.8.1
      undici: 5.29.0

  zod-to-json-schema@3.24.5(zod@3.25.67):
    dependencies:
      zod: 3.25.67

  zod@3.25.67: {}



================================================
FILE: smithery.yaml
================================================
# Smithery configuration file: https://smithery.ai/docs/config

startCommand:
  type: stdio
  configSchema:
    # JSON Schema defining the configuration options for the MCP.
    type: object
  commandFunction:
    # A function that produces the CLI command to start the MCP on stdio.
    |-
    config => ({ command: 'node', args: ['dist/index.js'] })


================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/*"],
  "exclude": ["node_modules"]
}



================================================
FILE: vitest.config.ts
================================================
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
    testTimeout: 30000, // 30 seconds for YouTube API calls
    hookTimeout: 30000,
  },
  esbuild: {
    target: "node18",
  },
});



================================================
FILE: .dockerignore
================================================
# Dependencies
node_modules
.pnpm-store

# Build output
dist

# Version control
.git
.gitignore

# IDE files
.vscode
.idea
*.swp
*.swo

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env
.env.*

# Test files
coverage
.nyc_output

# OS files
.DS_Store
Thumbs.db 


================================================
FILE: .npmignore
================================================
# Source
src/
tests/

# Config files
.eslintrc.json
.prettierrc
tsconfig.json
.dockerignore
Dockerfile
smithery.yaml

# Development files
.git/
.github/
.vscode/
.idea/
*.log
.DS_Store

# Dependencies
node_modules/
.pnpm-store/

# Test files
coverage/
.nyc_output/

# Environment
.env
.env.* 


================================================
FILE: .npmrc
================================================
engine-strict=true
strict-peer-dependencies=false


================================================
FILE: docs/KNOWN_ISSUES.md
================================================
# Known Issues

## Node.js Version Management with Claude App

### Issue Description

When using nvm (Node Version Manager) with multiple Node.js versions installed, Claude App exhibits specific behavior with node and npx commands.

#### Current Behavior
- Claude App defaults to using the lowest installed Node.js version
- Full path to node executable works (e.g., `/Users/username/.nvm/versions/node/v18.x.x/bin/node`)
- Full path to npx does not work effectively

#### Technical Analysis

1. Environment Variable Inheritance
   - Claude App is built on Electron, which has specific environment variable handling mechanisms
   - Electron initializes environment variables before command line flags and app code
   - Some environment variables are explicitly controlled by Electron:
     - `NODE_OPTIONS`: Limited support, some options are explicitly disallowed
     - `ELECTRON_RUN_AS_NODE`: Can be used to run as a normal Node.js process
   - The app may have its own environment isolation

2. Potential Root Causes
   - Electron's environment variable isolation may prevent proper npx path resolution
   - The way Electron handles `PATH` and executable resolution might differ from shell behavior
   - npx might be trying to use Electron's bundled Node.js version instead of the system one

#### Solution Found

1. Working Configuration:
```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": ["-y", "@gabriel3615/mcp-youtube-transcript"],
      "env": {
        "PATH": "/Users/username/.nvm/versions/node/v18.x.x/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    }
  }
}
```

2. Key Findings:
   - Using relative command name ("npx") works while full path does not
   - PATH environment variable must include complete system paths
   - No need for ELECTRON_RUN_AS_NODE when using this approach

3. Command Path Resolution Behavior:
   - Relative command names (e.g., "npx") work better than absolute paths
   - Possible reasons:
     - npx's internal Node.js environment dependencies
     - Electron's process creation mechanisms
     - Shell resolution and environment initialization
   - Using PATH allows proper environment setup for npm/npx tools

4. Best Practices:
   - Use relative command names in the configuration
   - Provide complete PATH including all system directories
   - Include the desired Node.js version bin directory first in PATH
   - Maintain full system paths for maximum compatibility:
     ```
     /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
     ```
     Reasons:
     - Different systems may have tools in different locations
     - Future dependencies might require additional system tools
     - Ensures compatibility across different Unix-like environments
     - Prevents potential issues with npm/npx dependencies

#### Current Status
- Issue Status: Resolved
- Solution: Use relative command name with PATH environment variable
- Impact: Successfully allows using specific Node.js version

#### Notes
- This solution maintains proper Node.js environment setup
- Works reliably across different Node.js versions
- May need adjustment if system paths change
- Document this approach for future reference
- While minimal PATH might work (e.g., just /bin for sh), full system paths are recommended for better compatibility

We will keep this document updated if we discover any additional insights or improvements. 


================================================
FILE: src/cli.ts
================================================
#!/usr/bin/env node

import { Command } from "commander";
import {
  YouTubeTranscriptFetcher,
  YouTubeUtils,
  YouTubeTranscriptError,
} from "./youtube/index.js";
import fs from "fs";
import path from "path";

const program = new Command();

program
  .name("youtube-transcript")
  .description("Extract transcripts from YouTube videos")
  .version("1.0.0");

program
  .command("transcript")
  .description("Extract transcripts from a YouTube video using the transcript ID")

  .argument("<url>", "YouTube video URL or ID")
  .option(
    "-l, --lang <language>",
    "Language code for transcripts (e.g. en, uk, ja, ru, zh)",
    "en"
  )
  .option("-p, --paragraphs", "Enable automatic paragraph breaks", false)
  .option(
    "-o, --output <file>",
    "Output file path (optional, defaults to stdout)"
  )
  .option("--json", "Output in JSON format", false)
  .action(
    async (
      url: string,
      options: {
        lang: string;
        paragraphs: boolean;
        output?: string;
        json: boolean;
      }
    ) => {
      try {
        console.error(`🎬 Processing YouTube video: ${url}`);

        // Extract video ID
        const videoId = YouTubeTranscriptFetcher.extractVideoId(url);
        console.error(`📝 Video ID: ${videoId}`);

        // Fetch transcripts
        const { transcripts, title } =
          await YouTubeTranscriptFetcher.fetchTranscripts(videoId, {
            lang: options.lang,
          });

        if (transcripts.length === 0) {
          throw new YouTubeTranscriptError(
            "No transcripts found for this video"
          );
        }

        console.error(`✅ Found ${transcripts.length} transcript segments`);
        console.error(`🎭 Title: ${title}`);
        console.error(`🌍 Language: ${options.lang}`);
        console.error(
          `⏱️  Total duration: ${YouTubeUtils.calculateTotalDuration(
            transcripts
          )} seconds`
        );

        let output: string;

        if (options.json) {
          // JSON output
          const jsonOutput = {
            videoId,
            title,
            language: options.lang,
            timestamp: new Date().toISOString(),
            totalDuration: YouTubeUtils.calculateTotalDuration(transcripts),
            transcriptCount: transcripts.length,
            transcripts: transcripts,
            formattedText: YouTubeUtils.formatTranscriptText(transcripts, {
              enableParagraphs: options.paragraphs,
            }),
          };
          output = JSON.stringify(jsonOutput, null, 2);
        } else {
          // Plain text output
          const formattedText = YouTubeUtils.formatTranscriptText(transcripts, {
            enableParagraphs: options.paragraphs,
          });
          output = `# ${title}\n\n${formattedText}`;
        }

        // Output to file or stdout
        if (options.output) {
          const outputPath = path.resolve(options.output);
          fs.writeFileSync(outputPath, output, "utf8");
          console.error(`💾 Transcript saved to: ${outputPath}`);
        } else {
          console.log(output);
        }

        console.error(
          `🎉 Successfully extracted transcript (${output.length} characters)`
        );
      } catch (error) {
        if (error instanceof YouTubeTranscriptError) {
          console.error(`❌ Error: ${error.message}`);
        } else {
          console.error(`❌ Unexpected error: ${(error as Error).message}`);
        }
        process.exit(1);
      }
    }
  );

program
  .command("download")
  .description("Download YouTube video using the transcript ID")
  .argument("<url>", "YouTube video URL or ID")
  .option(
    "-o, --output <file>",
    "Output file path (required)",
    "video.mp4"
  )
  .action(
    async (
      url: string,
      options: {
        output: string;
      }
    ) => {
      try {
        console.error(`🎬 Processing YouTube video download: ${url}`);

        // Extract video ID
        const videoId = YouTubeTranscriptFetcher.extractVideoId(url);
        console.error(`📝 Video ID: ${videoId}`);

        // Download the video
        console.error(`⏬ Downloading video...`);
        const outputPath = path.resolve(options.output);

        await YouTubeTranscriptFetcher.download(videoId, {
          output: outputPath,
        });

        console.error(`💾 Video saved to: ${outputPath}`);
        console.error(`🎉 Successfully downloaded video`);
      } catch (error) {
        if (error instanceof YouTubeTranscriptError) {
          console.error(`❌ Error: ${error.message}`);
        } else {
          console.error(`❌ Unexpected error: ${(error as Error).message}`);
        }
        process.exit(1);
      }
    }
  );

program.parse();



================================================
FILE: src/index.ts
================================================
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { YouTubeTranscriptFetcher, YouTubeUtils, YouTubeTranscriptError, TranscriptOptions, Transcript } from './youtube/index.js';
import { z } from "zod";

class YouTubeTranscriptExtractor {
  /**
   * Extracts YouTube video ID from various URL formats or direct ID input
   */
  extractYoutubeId(input: string): string {
    return YouTubeTranscriptFetcher.extractVideoId(input);
  }

  /**
   * Retrieves transcripts for a given video ID and language
   */
  async getTranscripts({ videoID, lang }: TranscriptOptions): Promise<{ transcripts: Transcript[], title: string }> {
    try {
      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoID, { lang });
      if (result.transcripts.length === 0) {
        throw new YouTubeTranscriptError('No transcripts found');
      }
      return result;
    } catch (error) {
      if (error instanceof YouTubeTranscriptError || error instanceof McpError) {
        throw error;
      }
      throw new YouTubeTranscriptError(`Failed to fetch transcripts: ${(error as Error).message}`);
    }
  }
}

class TranscriptServer {
  private extractor: YouTubeTranscriptExtractor;
  private server: McpServer;

  constructor() {
    this.extractor = new YouTubeTranscriptExtractor();
    this.server = new McpServer({
      name: "mcp-youtube-transcript",
      version: "0.0.1",
      description: "A server built on the Model Context Protocol (MCP) that enables direct downloading of YouTube video transcripts, supporting AI and video analysis workflows."
    });

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    process.on('SIGINT', async () => {
      await this.stop();
      process.exit(0);
    });
  }

  private setupTools(): void {
    this.server.tool(
      "get_transcripts",
      `Extract and process transcripts from a YouTube video.\n\n**Parameters:**\n- \`url\` (string, required): YouTube video URL or ID.\n- \`lang\` (string, optional, default 'en'): Language code for transcripts (e.g. 'en', 'uk', 'ja', 'ru', 'zh').\n- \`enableParagraphs\` (boolean, optional, default false): Enable automatic paragraph breaks.\n\n**IMPORTANT:** If the user does *not* specify a language *code*, **DO NOT** include the \`lang\` parameter in the tool call. Do not guess the language or use parts of the user query as the language code.`,
      {
        url: z.string().describe("YouTube video URL or ID"),
        lang: z.string().default("en").describe("Language code for transcripts, default 'en' (e.g. 'en', 'zh', 'ja', 'ru')"),
        enableParagraphs: z.boolean().default(false).describe("Enable automatic paragraph breaks, default `false`")
      },
      async (input) => {
        try {
          const videoId = this.extractor.extractYoutubeId(input.url);
          console.error(`Processing transcripts for video: ${videoId}`);
          
          const { transcripts, title } = await this.extractor.getTranscripts({ 
            videoID: videoId, 
            lang: input.lang 
          });
          
          // Format text with optional paragraph breaks
          const formattedText = YouTubeUtils.formatTranscriptText(transcripts, {
            enableParagraphs: input.enableParagraphs
          });
            
          console.error(`Successfully extracted transcripts for "${title}" (${formattedText.length} chars)`);
          
          return {
            content: [{
              type: "text",
              text: `# ${title}\n\n${formattedText}`,
              metadata: {
                videoId,
                title,
                language: input.lang,
                timestamp: new Date().toISOString(),
                charCount: formattedText.length,
                transcriptCount: transcripts.length,
                totalDuration: YouTubeUtils.calculateTotalDuration(transcripts),
                paragraphsEnabled: input.enableParagraphs
              }
            }]
          };
        } catch (error) {
          if (error instanceof YouTubeTranscriptError || error instanceof McpError) {
            throw error;
          }
          throw new YouTubeTranscriptError(`Failed to process transcripts: ${(error as Error).message}`);
        }
      }
    );
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  async stop(): Promise<void> {
    await this.server.close();
  }
}

async function main() {
  try {
    const server = new TranscriptServer();
    await server.start();
  } catch (error) {
    console.error('Server error:', error);
    process.exit(1);
  }
}

main();


================================================
FILE: src/youtube/error.ts
================================================
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class YouTubeTranscriptError extends McpError {
  constructor(message: string) {
    super(ErrorCode.InternalError, message);
    this.name = "YouTubeTranscriptError";
  }
}



================================================
FILE: src/youtube/fetcher.ts
================================================
import {ErrorCode, McpError} from "@modelcontextprotocol/sdk/types.js";
import {ClientType, Innertube, Log, Utils} from "youtubei.js";
import {Transcript} from "./types.js";
import {YouTubeTranscriptError} from "./error.js";
import fs from "fs";

Log.setLevel(Log.Level.INFO);

export class YouTubeTranscriptFetcher {
  private static youtube: Innertube | null = null;

  /**
   * Initialize YouTube.js Innertube instance
   */
  private static async initializeYouTube(): Promise<Innertube> {
    if (!this.youtube) {
      try {
        this.youtube = await Innertube.create();
      } catch (error) {
        throw new YouTubeTranscriptError(
          `Failed to initialize YouTube client: ${(error as Error).message}`
        );
      }
    }
    return this.youtube;
  }

  /**
   * Extract video ID from YouTube URL or direct ID input
   */
  static extractVideoId(input: string): string {
    if (!input) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "YouTube URL or ID is required"
      );
    }

    // Check if input is a valid 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    // Try to parse as a URL
    try {
      const url = new URL(input);
      if (url.hostname === "youtu.be") {
        return url.pathname.slice(1);
      }
      if (url.hostname.includes("youtube.com")) {
        if (url.pathname.startsWith("/shorts/")) {
          return url.pathname.slice(8);
        }
        const videoId = url.searchParams.get("v");
        if (videoId) {
          return videoId;
        }
      }
    } catch (error) {
      // Not a valid URL, fall through to regex matching
    }

    // Fallback to regex for other URL formats
    const match = input.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    if (match) {
      return match[1];
    }

    throw new McpError(
      ErrorCode.InvalidParams,
      `Could not extract video ID from: ${input}`
    );
  }

  /**
   * Recursively find transcript segments in the response object.
   */
  private static _findTranscriptSegments(obj: any): any[] {
    if (!obj || typeof obj !== "object") {
      return [];
    }
    if (obj.initial_segments && Array.isArray(obj.initial_segments)) {
      return obj.initial_segments;
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const result = this._findTranscriptSegments(obj[key]);
        if (result.length > 0) {
          return result;
        }
      }
    }
    return [];
  }

  /**
   * Download a YouTube video
   */
  static async download(
      videoId: string,
      options: {
        output: string
      }
  ): Promise<void> {

    try {
      const identifier = this.extractVideoId(videoId);
      const youtube = await this.initializeYouTube();

      const info = await youtube.getInfo(identifier, ClientType.ANDROID);

      const stream = await info.download({
        quality: 'best',
        client: ClientType.ANDROID
      });

      const file = fs.createWriteStream(options.output);
      for await (const chunk of Utils.streamToIterable(stream)) {
        file.write(chunk);
      }

      file.end();

    } catch (error) {
      throw new YouTubeTranscriptError(
          `Failed to download video: ${(error as Error).message}`
      );
    }
  }

  /**
   * Fetch transcripts and video information using YouTube.js
   */
  static async fetchTranscripts(
    videoId: string,
    config?: { lang?: string }
  ): Promise<{ transcripts: Transcript[]; title: string }> {
    try {
      const identifier = this.extractVideoId(videoId);
      const youtube = await this.initializeYouTube();

      const info = await youtube.getInfo(identifier);
      const title = info.basic_info?.title || "Untitled Video";

      const transcriptInfo = await info.getTranscript();
      if (!transcriptInfo) {
        throw new YouTubeTranscriptError(
          `No transcripts available for video ${identifier}`
        );
      }

      // Check available languages
      const availableLanguages = transcriptInfo.languages || [];
      let finalTranscriptInfo = transcriptInfo;
      if (config?.lang) {
        // Try to find a language that matches more flexibly
        const matchingLang = availableLanguages.find(
            (lang: string) =>
                lang.toLowerCase().includes(config.lang!.toLowerCase()) ||
                config.lang!.toLowerCase().includes(lang.toLowerCase())
        );

        if (matchingLang) {
          try {
            finalTranscriptInfo = await transcriptInfo.selectLanguage(
              config.lang
            );
          } catch (error) {
            console.warn(
              `Could not select language ${config.lang}, using default: ${transcriptInfo.selectedLanguage}`
            );
          }
        } else {
          throw new YouTubeTranscriptError(
            `Language ${
              config.lang
            } not available for video ${identifier}. Available languages: ${transcriptInfo.languages.join(
              ", "
            )}`
          );
        }
      }

      const segments = this._findTranscriptSegments(finalTranscriptInfo);
      if (!segments || segments.length === 0) {
        throw new YouTubeTranscriptError(
          `Unable to parse transcript structure for video ${identifier}. The transcript data format may have changed.`
        );
      }

      const transcripts: Transcript[] = segments
        .map((segment: any) => {
          if (segment.type !== "TranscriptSegment") return null;

          const startMs = parseFloat(segment.start_ms || "0");
          const endMs = parseFloat(segment.end_ms || "0");
          const text = (
            segment.snippet?.runs?.[0]?.text ||
            segment.snippet?.text ||
            ""
          ).trim();

          if (!text) return null;

          return {
            text,
            lang: finalTranscriptInfo.selectedLanguage || "en",
            timestamp: startMs / 1000,
            duration: Math.max(0, (endMs - startMs) / 1000),
          } as Transcript;
        })
        .filter((t): t is Transcript => t !== null);

      if (transcripts.length === 0) {
        throw new YouTubeTranscriptError(
          `No transcript segments found for video ${identifier}. The video may not have captions or they may be disabled.`
        );
      }

      // The API sometimes returns segments out of order.
      transcripts.sort((a, b) => a.timestamp - b.timestamp);

      return { transcripts, title };
    } catch (error) {
      throw new YouTubeTranscriptError(
        `Failed to fetch transcripts: ${(error as Error).message}`
      );
    }
  }
}



================================================
FILE: src/youtube/index.ts
================================================
export * from "./types.js";
export * from "./error.js";
export * from "./utils.js";
export * from "./fetcher.js";


================================================
FILE: src/youtube/types.ts
================================================
export interface Transcript {
  text: string; // Transcript text
  lang?: string; // Language code
  timestamp: number; // Start time in seconds
  duration: number; // Duration in seconds
}

export interface TranscriptOptions {
  videoID: string; // Video ID or URL
  lang?: string; // Language code, default 'en'
}



================================================
FILE: src/youtube/utils.ts
================================================
import { Transcript } from "./types.js";

export class YouTubeUtils {
  /**
   * Format time (convert seconds to readable format)
   */
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  }

  /**
   * Calculate total duration in seconds
   */
  static calculateTotalDuration(items: Transcript[]): number {
    return items.reduce(
      (acc, item) => Math.max(acc, item.timestamp + item.duration),
      0
    );
  }

  /**
   * Decode HTML entities
   */
  static decodeHTML(text: string): string {
    const entities: { [key: string]: string } = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": "\"",
      "&#39;": "'",
      "&apos;": "'",
      "&#x27;": "'",
      "&#x2F;": "/",
      "&#x2f;": "/",
      "&#47;": "/",
      "&#xa0;": " ",
      "&nbsp;": " ",
    };

    return text.replace(/&[^;]+;/g, (match) => entities[match] || match).trim();
  }

  /**
   * Normalize text formatting (punctuation and spaces)
   */
  static normalizeText(text: string): string {
    return text
      .replace(/\n/g, " ")
      .replace(/\s*\.\s*\.\s*/g, ". ") // Fix multiple dots
      .replace(/\s*\.\s+/g, ". ") // Normalize spaces after dots
      .replace(/\s+/g, " ") // Normalize spaces
      .replace(/\s+([,.])/g, "$1") // Fix spaces before punctuation
      .replace(/\s*\?\s*/g, "? ") // Normalize question marks
      .replace(/\s*!\s*/g, "! ") // Normalize exclamation marks
      .trim();
  }

  /**
   * Format transcript text with optional paragraph breaks
   */
  static formatTranscriptText(
    transcripts: Transcript[],
    options: {
      enableParagraphs?: boolean;
      timeGapThreshold?: number;
      maxSentencesPerParagraph?: number;
    } = {}
  ): string {
    const {
      enableParagraphs = false,
      timeGapThreshold = 2,
      maxSentencesPerParagraph = 5,
    } = options;

    const processedTranscripts = transcripts
      .map((transcript) => this.decodeHTML(transcript.text))
      .filter((text) => text.length > 0);

    if (!enableParagraphs) {
      return this.normalizeText(processedTranscripts.join(" "));
    }

    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];
    let lastEndTime = 0;

    for (const transcript of transcripts) {
      const text = this.decodeHTML(transcript.text.trim());
      if (!text) continue;

      const timeGap = transcript.timestamp - lastEndTime;
      const previousText = currentParagraph[currentParagraph.length - 1] || "";

      const isTimeGap = timeGap > timeGapThreshold;
      const isNewSentence = previousText.endsWith(".") && /^[A-Z]/.test(text);
      const isParagraphFull =
        currentParagraph.length >= maxSentencesPerParagraph;

      const shouldStartNewParagraph =
        isTimeGap || isNewSentence || isParagraphFull;

      if (shouldStartNewParagraph && currentParagraph.length > 0) {
        paragraphs.push(this.normalizeText(currentParagraph.join(" ")));
        currentParagraph = [];
      }

      currentParagraph.push(text);
      lastEndTime = transcript.timestamp + transcript.duration;
    }

    if (currentParagraph.length > 0) {
      paragraphs.push(this.normalizeText(currentParagraph.join(" ")));
    }

    return paragraphs.join("\n\n");
  }
}



================================================
FILE: tests/youtube.test.ts
================================================
import { describe, it, expect } from "vitest";
import * as fs from 'fs';
// @ts-ignore
import {YouTubeTranscriptError, YouTubeTranscriptFetcher, YouTubeUtils} from "../src/youtube";


describe("YouTubeTranscriptFetcher", () => {
  describe("extractVideoId", () => {
    it("should extract video ID from various YouTube URL formats", () => {
      const testCases = [
        {
          input: "https://www.youtube.com/watch?v=gzBS9eh-Eh4",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://www.youtube.com/watch?v=gzBS9eh-Eh4&t=65s",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://youtu.be/gzBS9eh-Eh4",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://youtu.be/gzBS9eh-Eh4?t=65",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://www.youtube.com/shorts/gzBS9eh-Eh4",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "gzBS9eh-Eh4", // Direct video ID
          expected: "gzBS9eh-Eh4",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeTranscriptFetcher.extractVideoId(input)).toBe(expected);
      });
    });

    it("should throw error for invalid inputs", () => {
      const invalidInputs = [
        "",
        "not-a-url",
        "https://example.com",
        "https://www.youtube.com/watch",
        "invalid-video-id",
      ];

      invalidInputs.forEach((input) => {
        expect(() => YouTubeTranscriptFetcher.extractVideoId(input)).toThrow();
      });
    });
  });

  describe("fetchTranscripts", () => {
    it("should fetch transcripts for a valid video with captions", async () => {
      // Using the test video from our earlier testing
      const videoId = "gzBS9eh-Eh4";

      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoId);

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.title).toBe("BITCOIN: MARKET IS BECOMING INSANE!!! 🚨🔥");
      expect(result.transcripts).toBeDefined();
      expect(Array.isArray(result.transcripts)).toBe(true);
      expect(result.transcripts.length).toBeGreaterThan(0);

      // Check transcript structure
      const firstTranscript = result.transcripts[0];

      expect(firstTranscript).toHaveProperty("text");
      expect(firstTranscript).toHaveProperty("timestamp");
      expect(firstTranscript).toHaveProperty("duration");
      expect(firstTranscript).toHaveProperty("lang");

      expect(typeof firstTranscript.text).toBe("string");
      expect(typeof firstTranscript.timestamp).toBe("number");
      expect(typeof firstTranscript.duration).toBe("number");
      expect(firstTranscript.text.length).toBeGreaterThan(0);
    }, 30000);

    it("should fetch transcripts with URL input", async () => {
      const videoUrl = "https://www.youtube.com/watch?v=gzBS9eh-Eh4&t=65s";

      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoUrl);

      expect(result).toBeDefined();
      expect(result.transcripts.length).toBeGreaterThan(0);
    }, 30000);

    it("should handle videos without transcripts gracefully", async () => {
      // Using a video ID that likely doesn't have captions
      // Note: This test might be flaky depending on the video
      const videoId = "invalid_video_id_123";

      await expect(
        YouTubeTranscriptFetcher.fetchTranscripts(videoId)
      ).rejects.toThrow();
    }, 30000);

    it("should validate transcript data integrity", async () => {
      const videoId = "gzBS9eh-Eh4";

      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoId);

      // Validate that transcripts are sorted by timestamp
      for (let i = 1; i < result.transcripts.length; i++) {
        expect(result.transcripts[i].timestamp).toBeGreaterThanOrEqual(
          result.transcripts[i - 1].timestamp
        );
      }

      // Validate that all transcripts have positive duration
      result.transcripts.forEach((transcript: { duration: any; timestamp: any; }) => {
        expect(transcript.duration).toBeGreaterThanOrEqual(0);
        expect(transcript.timestamp).toBeGreaterThanOrEqual(0);
      });
    }, 30000);
  });
});

describe("YouTubeUtils", () => {
  describe("formatTime", () => {
    it("should format time correctly", () => {
      const testCases = [
        { input: 0, expected: "00:00:00.000" },
        { input: 65.5, expected: "00:01:05.500" },
        { input: 3661.123, expected: "01:01:01.123" },
        { input: 7323.456, expected: "02:02:03.456" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeUtils.formatTime(input)).toBe(expected);
      });
    });
  });

  describe("calculateTotalDuration", () => {
    it("should calculate total duration correctly", () => {
      const transcripts = [
        { text: "test1", timestamp: 0, duration: 5, lang: "en" },
        { text: "test2", timestamp: 10, duration: 3, lang: "en" },
        { text: "test3", timestamp: 20, duration: 7, lang: "en" },
      ];

      const totalDuration = YouTubeUtils.calculateTotalDuration(transcripts);
      expect(totalDuration).toBe(27); // 20 + 7 = 27
    });

    it("should handle empty array", () => {
      expect(YouTubeUtils.calculateTotalDuration([])).toBe(0);
    });
  });

  describe("decodeHTML", () => {
    it("should decode HTML entities correctly", () => {
      const testCases = [
        { input: "&amp;", expected: "&" },
        { input: "&lt;script&gt;", expected: "<script>" },
        { input: "&quot;hello&quot;", expected: '"hello"' },
        { input: "normal text", expected: "normal text" },
        { input: "&amp;lt;test&amp;gt;", expected: "&lt;test&gt;" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeUtils.decodeHTML(input)).toBe(expected);
      });
    });
  });

  describe("normalizeText", () => {
    it("should normalize text formatting correctly", () => {
      const testCases = [
        {
          input: "Hello   world  .  This is   a test .",
          expected: "Hello world. This is a test.",
        },
        {
          input: "Text with\nnewlines\nand   spaces",
          expected: "Text with newlines and spaces",
        },
        {
          input: "Question ?  Answer !",
          expected: "Question? Answer!",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeUtils.normalizeText(input)).toBe(expected);
      });
    });
  });

  describe("formatTranscriptText", () => {
    const sampleTranscripts = [
      { text: "Hello world.", timestamp: 0, duration: 2, lang: "en" },
      { text: "This is a test.", timestamp: 2, duration: 3, lang: "en" },
      { text: "Another sentence.", timestamp: 8, duration: 2, lang: "en" }, // Gap > 2s
    ];

    it("should format transcript text without paragraphs", () => {
      const result = YouTubeUtils.formatTranscriptText(sampleTranscripts);
      expect(result).toBe("Hello world. This is a test. Another sentence.");
    });

    it("should format transcript text with paragraphs", () => {
      const result = YouTubeUtils.formatTranscriptText(sampleTranscripts, {
        enableParagraphs: true,
        timeGapThreshold: 2,
      });

      // Should create paragraph break due to time gap
      expect(result).toContain("\n\n");
    });

    it("should handle empty transcripts", () => {
      const result = YouTubeUtils.formatTranscriptText([]);
      expect(result).toBe("");
    });
  });
});

describe("Error Handling", () => {
  it("should create YouTubeTranscriptError correctly", () => {
    const error = new YouTubeTranscriptError("Test error message");
    expect(error.name).toBe("YouTubeTranscriptError");
    expect(error.message).toContain("Test error message");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("download", () => {
  it("should download a video successfully", async () => {
    // Using a short test video
    const videoId = "gzBS9eh-Eh4";
    const outputPath = "test-download.mp4";
    
    try {
      // Delete the file if it already exists
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      // Download the video
      await YouTubeTranscriptFetcher.download(videoId, {
        output: outputPath,
        quality: "lowest", // Use lowest quality for faster test
      });
      
      // Check if file exists and has content
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
      
      // Clean up
      fs.unlinkSync(outputPath);
    } catch (error) {
      // Clean up in case of error
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      throw error;
    }
  }, 60000); // Increase timeout to 60 seconds for download
  
  it("should throw error for invalid video ID", async () => {
    const invalidVideoId = "invalid_video_id_123";
    const outputPath = "invalid-download.mp4";
    
    await expect(
      YouTubeTranscriptFetcher.download(invalidVideoId, {
        output: outputPath,
      })
    ).rejects.toThrow();
    
    // Ensure no file was created
    expect(fs.existsSync(outputPath)).toBe(false);
  }, 30000);
  
  it("should handle download with URL input", async () => {
    const videoUrl = "https://www.youtube.com/watch?v=gzBS9eh-Eh4&t=65s";
    const outputPath = "url-download.mp4";
    
    try {
      // Delete the file if it already exists
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      // Download the video
      await YouTubeTranscriptFetcher.download(videoUrl, {
        output: outputPath,
        quality: "lowest", // Use lowest quality for faster test
      });
      
      // Check if file exists and has content
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
      
      // Clean up
      fs.unlinkSync(outputPath);
    } catch (error) {
      // Clean up in case of error
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      throw error;
    }
  }, 60000);
});


================================================
FILE: .github/workflows/issue-manager.yml
================================================
name: Issue Manager

on:
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
  issues:
    types: [opened, reopened]

jobs:
  close-stale-issues:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - name: Check for stale issues
        uses: actions/stale@v9
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          stale-issue-message: 'This issue has been automatically closed due to inactivity. If you still need help, please feel free to reopen it.'
          stale-issue-label: 'stale'
          days-before-stale: 30
          days-before-close: 7
          exempt-issue-labels: 'pinned,help-wanted'
          only-issue-labels: ''
          operations-per-run: 30 


================================================
FILE: .github/workflows/publish.yml
================================================
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish-gpr:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@gabriel3615'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ github.token }}

  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
          scope: '@gabriel3615'
      - run: |
          echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" > .npmrc
          npm ci
          npm run build
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} 




================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2024 Freddie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: package.json
================================================
{
  "name": "@gabriel3615/mcp-youtube-transcript",
  "version": "0.0.14",
  "description": "A server built on the Model Context Protocol (MCP) that enables direct downloading of YouTube video transcripts, supporting AI and video analysis workflows.",
  "license": "MIT",
  "author": "sinco",
  "homepage": "https://github.com/flying3615/mcp-youtube-transcript",
  "repository": {
    "type": "git",
    "url": "https://github.com/flying3615/mcp-youtube-transcript.git"
  },
  "bugs": {
    "url": "https://github.com/flying3615/mcp-youtube-transcript/issues"
  },
  "keywords": [
    "mcp",
    "youtube",
    "transcript",
    "subtitles",
    "captions",
    "video",
    "ai",
    "claude",
    "cursor",
    "cline",
    "modelcontextprotocol"
  ],
  "type": "module",
  "publishConfig": {
    "access": "public"
  },
  "main": "dist/index.js",
  "module": "dist/index.js",
  "bin": {
    "mcp-youtube-transcript": "dist/index.js",
    "youtube-transcript": "dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "rimraf dist && tsc",
    "cli": "pnpm build && node dist/cli.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "prepublishOnly": "npm run build",
    "release:patch": "npm version patch && npm publish --access public",
    "release:minor": "npm version minor && npm publish --access public",
    "release:major": "npm version major && npm publish --access public"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.7.0",
    "commander": "^14.0.0",
    "youtubei.js": "^14.0.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "@vitest/ui": "^3.2.4",
    "typescript": "^5.6.2",
    "vitest": "^3.2.4",
    "rimraf": "^6.0.1"
  }
}



================================================
FILE: pnpm-lock.yaml
================================================
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      '@modelcontextprotocol/sdk':
        specifier: 1.7.0
        version: 1.7.0
      commander:
        specifier: ^14.0.0
        version: 14.0.0
      youtubei.js:
        specifier: ^14.0.0
        version: 14.0.0
      zod:
        specifier: ^3.24.2
        version: 3.25.67
    devDependencies:
      '@types/node':
        specifier: ^20.11.24
        version: 20.19.1
      '@vitest/ui':
        specifier: ^3.2.4
        version: 3.2.4(vitest@3.2.4)
      rimraf:
        specifier: ^6.0.1
        version: 6.0.1
      typescript:
        specifier: ^5.6.2
        version: 5.8.3
      vitest:
        specifier: ^3.2.4
        version: 3.2.4(@types/node@20.19.1)(@vitest/ui@3.2.4)

packages:

  '@bufbuild/protobuf@2.5.2':
    resolution: {integrity: sha512-foZ7qr0IsUBjzWIq+SuBLfdQCpJ1j8cTuNNT4owngTHoN5KsJb8L9t65fzz7SCeSWzescoOil/0ldqiL041ABg==}

  '@esbuild/aix-ppc64@0.25.5':
    resolution: {integrity: sha512-9o3TMmpmftaCMepOdA5k/yDw8SfInyzWWTjYTFCX3kPSDJMROQTb8jg+h9Cnwnmm1vOzvxN7gIfB5V2ewpjtGA==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [aix]

  '@esbuild/android-arm64@0.25.5':
    resolution: {integrity: sha512-VGzGhj4lJO+TVGV1v8ntCZWJktV7SGCs3Pn1GRWI1SBFtRALoomm8k5E9Pmwg3HOAal2VDc2F9+PM/rEY6oIDg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm@0.25.5':
    resolution: {integrity: sha512-AdJKSPeEHgi7/ZhuIPtcQKr5RQdo6OO2IL87JkianiMYMPbCtot9fxPbrMiBADOWWm3T2si9stAiVsGbTQFkbA==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-x64@0.25.5':
    resolution: {integrity: sha512-D2GyJT1kjvO//drbRT3Hib9XPwQeWd9vZoBJn+bu/lVsOZ13cqNdDeqIF/xQ5/VmWvMduP6AmXvylO/PIc2isw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [android]

  '@esbuild/darwin-arm64@0.25.5':
    resolution: {integrity: sha512-GtaBgammVvdF7aPIgH2jxMDdivezgFu6iKpmT+48+F8Hhg5J/sfnDieg0aeG/jfSvkYQU2/pceFPDKlqZzwnfQ==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-x64@0.25.5':
    resolution: {integrity: sha512-1iT4FVL0dJ76/q1wd7XDsXrSW+oLoquptvh4CLR4kITDtqi2e/xwXwdCVH8hVHU43wgJdsq7Gxuzcs6Iq/7bxQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/freebsd-arm64@0.25.5':
    resolution: {integrity: sha512-nk4tGP3JThz4La38Uy/gzyXtpkPW8zSAmoUhK9xKKXdBCzKODMc2adkB2+8om9BDYugz+uGV7sLmpTYzvmz6Sw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.25.5':
    resolution: {integrity: sha512-PrikaNjiXdR2laW6OIjlbeuCPrPaAl0IwPIaRv+SMV8CiM8i2LqVUHFC1+8eORgWyY7yhQY+2U2fA55mBzReaw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/linux-arm64@0.25.5':
    resolution: {integrity: sha512-Z9kfb1v6ZlGbWj8EJk9T6czVEjjq2ntSYLY2cw6pAZl4oKtfgQuS4HOq41M/BcoLPzrUbNd+R4BXFyH//nHxVg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm@0.25.5':
    resolution: {integrity: sha512-cPzojwW2okgh7ZlRpcBEtsX7WBuqbLrNXqLU89GxWbNt6uIg78ET82qifUy3W6OVww6ZWobWub5oqZOVtwolfw==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-ia32@0.25.5':
    resolution: {integrity: sha512-sQ7l00M8bSv36GLV95BVAdhJ2QsIbCuCjh/uYrWiMQSUuV+LpXwIqhgJDcvMTj+VsQmqAHL2yYaasENvJ7CDKA==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-loong64@0.25.5':
    resolution: {integrity: sha512-0ur7ae16hDUC4OL5iEnDb0tZHDxYmuQyhKhsPBV8f99f6Z9KQM02g33f93rNH5A30agMS46u2HP6qTdEt6Q1kg==}
    engines: {node: '>=18'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-mips64el@0.25.5':
    resolution: {integrity: sha512-kB/66P1OsHO5zLz0i6X0RxlQ+3cu0mkxS3TKFvkb5lin6uwZ/ttOkP3Z8lfR9mJOBk14ZwZ9182SIIWFGNmqmg==}
    engines: {node: '>=18'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-ppc64@0.25.5':
    resolution: {integrity: sha512-UZCmJ7r9X2fe2D6jBmkLBMQetXPXIsZjQJCjgwpVDz+YMcS6oFR27alkgGv3Oqkv07bxdvw7fyB71/olceJhkQ==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-riscv64@0.25.5':
    resolution: {integrity: sha512-kTxwu4mLyeOlsVIFPfQo+fQJAV9mh24xL+y+Bm6ej067sYANjyEw1dNHmvoqxJUCMnkBdKpvOn0Ahql6+4VyeA==}
    engines: {node: '>=18'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-s390x@0.25.5':
    resolution: {integrity: sha512-K2dSKTKfmdh78uJ3NcWFiqyRrimfdinS5ErLSn3vluHNeHVnBAFWC8a4X5N+7FgVE1EjXS1QDZbpqZBjfrqMTQ==}
    engines: {node: '>=18'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-x64@0.25.5':
    resolution: {integrity: sha512-uhj8N2obKTE6pSZ+aMUbqq+1nXxNjZIIjCjGLfsWvVpy7gKCOL6rsY1MhRh9zLtUtAI7vpgLMK6DxjO8Qm9lJw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [linux]

  '@esbuild/netbsd-arm64@0.25.5':
    resolution: {integrity: sha512-pwHtMP9viAy1oHPvgxtOv+OkduK5ugofNTVDilIzBLpoWAM16r7b/mxBvfpuQDpRQFMfuVr5aLcn4yveGvBZvw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [netbsd]

  '@esbuild/netbsd-x64@0.25.5':
    resolution: {integrity: sha512-WOb5fKrvVTRMfWFNCroYWWklbnXH0Q5rZppjq0vQIdlsQKuw6mdSihwSo4RV/YdQ5UCKKvBy7/0ZZYLBZKIbwQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/openbsd-arm64@0.25.5':
    resolution: {integrity: sha512-7A208+uQKgTxHd0G0uqZO8UjK2R0DDb4fDmERtARjSHWxqMTye4Erz4zZafx7Di9Cv+lNHYuncAkiGFySoD+Mw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openbsd]

  '@esbuild/openbsd-x64@0.25.5':
    resolution: {integrity: sha512-G4hE405ErTWraiZ8UiSoesH8DaCsMm0Cay4fsFWOOUcz8b8rC6uCvnagr+gnioEjWn0wC+o1/TAHt+It+MpIMg==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/sunos-x64@0.25.5':
    resolution: {integrity: sha512-l+azKShMy7FxzY0Rj4RCt5VD/q8mG/e+mDivgspo+yL8zW7qEwctQ6YqKX34DTEleFAvCIUviCFX1SDZRSyMQA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/win32-arm64@0.25.5':
    resolution: {integrity: sha512-O2S7SNZzdcFG7eFKgvwUEZ2VG9D/sn/eIiz8XRZ1Q/DO5a3s76Xv0mdBzVM5j5R639lXQmPmSo0iRpHqUUrsxw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-ia32@0.25.5':
    resolution: {integrity: sha512-onOJ02pqs9h1iMJ1PQphR+VZv8qBMQ77Klcsqv9CNW2w6yLqoURLcgERAIurY6QE63bbLuqgP9ATqajFLK5AMQ==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-x64@0.25.5':
    resolution: {integrity: sha512-TXv6YnJ8ZMVdX+SXWVBo/0p8LTcrUYngpWjvm91TMjjBQii7Oz11Lw5lbDV5Y0TzuhSJHwiH4hEtC1I42mMS0g==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [win32]

  '@fastify/busboy@2.1.1':
    resolution: {integrity: sha512-vBZP4NlzfOlerQTnba4aqZoMhE/a9HY7HRqoOPaETQcSQuWEIyZMHGfVu6w9wGtGK5fED5qRs2DteVCjOH60sA==}
    engines: {node: '>=14'}

  '@isaacs/balanced-match@4.0.1':
    resolution: {integrity: sha512-yzMTt9lEb8Gv7zRioUilSglI0c0smZ9k5D65677DLWLtWJaXIS3CqcGyUFByYKlnUj6TkjLVs54fBl6+TiGQDQ==}
    engines: {node: 20 || >=22}

  '@isaacs/brace-expansion@5.0.0':
    resolution: {integrity: sha512-ZT55BDLV0yv0RBm2czMiZ+SqCGO7AvmOM3G/w2xhVPH+te0aKgFjmBvGlL1dH+ql2tgGO3MVrbb3jCKyvpgnxA==}
    engines: {node: 20 || >=22}

  '@isaacs/cliui@8.0.2':
    resolution: {integrity: sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==}
    engines: {node: '>=12'}

  '@jridgewell/sourcemap-codec@1.5.0':
    resolution: {integrity: sha512-gv3ZRaISU3fjPAgNsriBRqGWQL6quFx04YMPW/zD8XMLsU32mhCCbfbO6KZFLjvYpCZ8zyDEgqsgf+PwPaM7GQ==}

  '@modelcontextprotocol/sdk@1.7.0':
    resolution: {integrity: sha512-IYPe/FLpvF3IZrd/f5p5ffmWhMc3aEMuM2wGJASDqC2Ge7qatVCdbfPx3n/5xFeb19xN0j/911M2AaFuircsWA==}
    engines: {node: '>=18'}

  '@polka/url@1.0.0-next.29':
    resolution: {integrity: sha512-wwQAWhWSuHaag8c4q/KN/vCoeOJYshAIvMQwD4GpSb3OiZklFfvAgmj0VCBBImRpuF/aFgIRzllXlVX93Jevww==}

  '@rollup/rollup-android-arm-eabi@4.44.0':
    resolution: {integrity: sha512-xEiEE5oDW6tK4jXCAyliuntGR+amEMO7HLtdSshVuhFnKTYoeYMyXQK7pLouAJJj5KHdwdn87bfHAR2nSdNAUA==}
    cpu: [arm]
    os: [android]

  '@rollup/rollup-android-arm64@4.44.0':
    resolution: {integrity: sha512-uNSk/TgvMbskcHxXYHzqwiyBlJ/lGcv8DaUfcnNwict8ba9GTTNxfn3/FAoFZYgkaXXAdrAA+SLyKplyi349Jw==}
    cpu: [arm64]
    os: [android]

  '@rollup/rollup-darwin-arm64@4.44.0':
    resolution: {integrity: sha512-VGF3wy0Eq1gcEIkSCr8Ke03CWT+Pm2yveKLaDvq51pPpZza3JX/ClxXOCmTYYq3us5MvEuNRTaeyFThCKRQhOA==}
    cpu: [arm64]
    os: [darwin]

  '@rollup/rollup-darwin-x64@4.44.0':
    resolution: {integrity: sha512-fBkyrDhwquRvrTxSGH/qqt3/T0w5Rg0L7ZIDypvBPc1/gzjJle6acCpZ36blwuwcKD/u6oCE/sRWlUAcxLWQbQ==}
    cpu: [x64]
    os: [darwin]

  '@rollup/rollup-freebsd-arm64@4.44.0':
    resolution: {integrity: sha512-u5AZzdQJYJXByB8giQ+r4VyfZP+walV+xHWdaFx/1VxsOn6eWJhK2Vl2eElvDJFKQBo/hcYIBg/jaKS8ZmKeNQ==}
    cpu: [arm64]
    os: [freebsd]

  '@rollup/rollup-freebsd-x64@4.44.0':
    resolution: {integrity: sha512-qC0kS48c/s3EtdArkimctY7h3nHicQeEUdjJzYVJYR3ct3kWSafmn6jkNCA8InbUdge6PVx6keqjk5lVGJf99g==}
    cpu: [x64]
    os: [freebsd]

  '@rollup/rollup-linux-arm-gnueabihf@4.44.0':
    resolution: {integrity: sha512-x+e/Z9H0RAWckn4V2OZZl6EmV0L2diuX3QB0uM1r6BvhUIv6xBPL5mrAX2E3e8N8rEHVPwFfz/ETUbV4oW9+lQ==}
    cpu: [arm]
    os: [linux]

  '@rollup/rollup-linux-arm-musleabihf@4.44.0':
    resolution: {integrity: sha512-1exwiBFf4PU/8HvI8s80icyCcnAIB86MCBdst51fwFmH5dyeoWVPVgmQPcKrMtBQ0W5pAs7jBCWuRXgEpRzSCg==}
    cpu: [arm]
    os: [linux]

  '@rollup/rollup-linux-arm64-gnu@4.44.0':
    resolution: {integrity: sha512-ZTR2mxBHb4tK4wGf9b8SYg0Y6KQPjGpR4UWwTFdnmjB4qRtoATZ5dWn3KsDwGa5Z2ZBOE7K52L36J9LueKBdOQ==}
    cpu: [arm64]
    os: [linux]

  '@rollup/rollup-linux-arm64-musl@4.44.0':
    resolution: {integrity: sha512-GFWfAhVhWGd4r6UxmnKRTBwP1qmModHtd5gkraeW2G490BpFOZkFtem8yuX2NyafIP/mGpRJgTJ2PwohQkUY/Q==}
    cpu: [arm64]
    os: [linux]

  '@rollup/rollup-linux-loongarch64-gnu@4.44.0':
    resolution: {integrity: sha512-xw+FTGcov/ejdusVOqKgMGW3c4+AgqrfvzWEVXcNP6zq2ue+lsYUgJ+5Rtn/OTJf7e2CbgTFvzLW2j0YAtj0Gg==}
    cpu: [loong64]
    os: [linux]

  '@rollup/rollup-linux-powerpc64le-gnu@4.44.0':
    resolution: {integrity: sha512-bKGibTr9IdF0zr21kMvkZT4K6NV+jjRnBoVMt2uNMG0BYWm3qOVmYnXKzx7UhwrviKnmK46IKMByMgvpdQlyJQ==}
    cpu: [ppc64]
    os: [linux]

  '@rollup/rollup-linux-riscv64-gnu@4.44.0':
    resolution: {integrity: sha512-vV3cL48U5kDaKZtXrti12YRa7TyxgKAIDoYdqSIOMOFBXqFj2XbChHAtXquEn2+n78ciFgr4KIqEbydEGPxXgA==}
    cpu: [riscv64]
    os: [linux]

  '@rollup/rollup-linux-riscv64-musl@4.44.0':
    resolution: {integrity: sha512-TDKO8KlHJuvTEdfw5YYFBjhFts2TR0VpZsnLLSYmB7AaohJhM8ctDSdDnUGq77hUh4m/djRafw+9zQpkOanE2Q==}
    cpu: [riscv64]
    os: [linux]

  '@rollup/rollup-linux-s390x-gnu@4.44.0':
    resolution: {integrity: sha512-8541GEyktXaw4lvnGp9m84KENcxInhAt6vPWJ9RodsB/iGjHoMB2Pp5MVBCiKIRxrxzJhGCxmNzdu+oDQ7kwRA==}
    cpu: [s390x]
    os: [linux]

  '@rollup/rollup-linux-x64-gnu@4.44.0':
    resolution: {integrity: sha512-iUVJc3c0o8l9Sa/qlDL2Z9UP92UZZW1+EmQ4xfjTc1akr0iUFZNfxrXJ/R1T90h/ILm9iXEY6+iPrmYB3pXKjw==}
    cpu: [x64]
    os: [linux]

  '@rollup/rollup-linux-x64-musl@4.44.0':
    resolution: {integrity: sha512-PQUobbhLTQT5yz/SPg116VJBgz+XOtXt8D1ck+sfJJhuEsMj2jSej5yTdp8CvWBSceu+WW+ibVL6dm0ptG5fcA==}
    cpu: [x64]
    os: [linux]

  '@rollup/rollup-win32-arm64-msvc@4.44.0':
    resolution: {integrity: sha512-M0CpcHf8TWn+4oTxJfh7LQuTuaYeXGbk0eageVjQCKzYLsajWS/lFC94qlRqOlyC2KvRT90ZrfXULYmukeIy7w==}
    cpu: [arm64]
    os: [win32]

  '@rollup/rollup-win32-ia32-msvc@4.44.0':
    resolution: {integrity: sha512-3XJ0NQtMAXTWFW8FqZKcw3gOQwBtVWP/u8TpHP3CRPXD7Pd6s8lLdH3sHWh8vqKCyyiI8xW5ltJScQmBU9j7WA==}
    cpu: [ia32]
    os: [win32]

  '@rollup/rollup-win32-x64-msvc@4.44.0':
    resolution: {integrity: sha512-Q2Mgwt+D8hd5FIPUuPDsvPR7Bguza6yTkJxspDGkZj7tBRn2y4KSWYuIXpftFSjBra76TbKerCV7rgFPQrn+wQ==}
    cpu: [x64]
    os: [win32]

  '@types/chai@5.2.2':
    resolution: {integrity: sha512-8kB30R7Hwqf40JPiKhVzodJs2Qc1ZJ5zuT3uzw5Hq/dhNCl3G3l83jfpdI1e20BP348+fV7VIL/+FxaXkqBmWg==}

  '@types/deep-eql@4.0.2':
    resolution: {integrity: sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==}

  '@types/estree@1.0.8':
    resolution: {integrity: sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==}

  '@types/node@20.19.1':
    resolution: {integrity: sha512-jJD50LtlD2dodAEO653i3YF04NWak6jN3ky+Ri3Em3mGR39/glWiboM/IePaRbgwSfqM1TpGXfAg8ohn/4dTgA==}

  '@vitest/expect@3.2.4':
    resolution: {integrity: sha512-Io0yyORnB6sikFlt8QW5K7slY4OjqNX9jmJQ02QDda8lyM6B5oNgVWoSoKPac8/kgnCUzuHQKrSLtu/uOqqrig==}

  '@vitest/mocker@3.2.4':
    resolution: {integrity: sha512-46ryTE9RZO/rfDd7pEqFl7etuyzekzEhUbTW3BvmeO/BcCMEgq59BKhek3dXDWgAj4oMK6OZi+vRr1wPW6qjEQ==}
    peerDependencies:
      msw: ^2.4.9
      vite: ^5.0.0 || ^6.0.0 || ^7.0.0-0
    peerDependenciesMeta:
      msw:
        optional: true
      vite:
        optional: true

  '@vitest/pretty-format@3.2.4':
    resolution: {integrity: sha512-IVNZik8IVRJRTr9fxlitMKeJeXFFFN0JaB9PHPGQ8NKQbGpfjlTx9zO4RefN8gp7eqjNy8nyK3NZmBzOPeIxtA==}

  '@vitest/runner@3.2.4':
    resolution: {integrity: sha512-oukfKT9Mk41LreEW09vt45f8wx7DordoWUZMYdY/cyAk7w5TWkTRCNZYF7sX7n2wB7jyGAl74OxgwhPgKaqDMQ==}

  '@vitest/snapshot@3.2.4':
    resolution: {integrity: sha512-dEYtS7qQP2CjU27QBC5oUOxLE/v5eLkGqPE0ZKEIDGMs4vKWe7IjgLOeauHsR0D5YuuycGRO5oSRXnwnmA78fQ==}

  '@vitest/spy@3.2.4':
    resolution: {integrity: sha512-vAfasCOe6AIK70iP5UD11Ac4siNUNJ9i/9PZ3NKx07sG6sUxeag1LWdNrMWeKKYBLlzuK+Gn65Yd5nyL6ds+nw==}

  '@vitest/ui@3.2.4':
    resolution: {integrity: sha512-hGISOaP18plkzbWEcP/QvtRW1xDXF2+96HbEX6byqQhAUbiS5oH6/9JwW+QsQCIYON2bI6QZBF+2PvOmrRZ9wA==}
    peerDependencies:
      vitest: 3.2.4

  '@vitest/utils@3.2.4':
    resolution: {integrity: sha512-fB2V0JFrQSMsCo9HiSq3Ezpdv4iYaXRG1Sx8edX3MwxfyNn83mKiGzOcH+Fkxt4MHxr3y42fQi1oeAInqgX2QA==}

  accepts@2.0.0:
    resolution: {integrity: sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==}
    engines: {node: '>= 0.6'}

  acorn@8.15.0:
    resolution: {integrity: sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==}
    engines: {node: '>=0.4.0'}
    hasBin: true

  ansi-regex@5.0.1:
    resolution: {integrity: sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==}
    engines: {node: '>=8'}

  ansi-regex@6.1.0:
    resolution: {integrity: sha512-7HSX4QQb4CspciLpVFwyRe79O3xsIZDDLER21kERQ71oaPodF8jL725AgJMFAYbooIqolJoRLuM81SpeUkpkvA==}
    engines: {node: '>=12'}

  ansi-styles@4.3.0:
    resolution: {integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==}
    engines: {node: '>=8'}

  ansi-styles@6.2.1:
    resolution: {integrity: sha512-bN798gFfQX+viw3R7yrGWRqnrN2oRkEkUjjl4JNn4E8GxxbjtG3FbrEIIY3l8/hrwUwIeCZvi4QuOTP4MErVug==}
    engines: {node: '>=12'}

  assertion-error@2.0.1:
    resolution: {integrity: sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==}
    engines: {node: '>=12'}

  body-parser@2.2.0:
    resolution: {integrity: sha512-02qvAaxv8tp7fBa/mw1ga98OGm+eCbqzJOKoRt70sLmfEEi+jyBYVTDGfCL/k06/4EMk/z01gCe7HoCH/f2LTg==}
    engines: {node: '>=18'}

  bytes@3.1.2:
    resolution: {integrity: sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==}
    engines: {node: '>= 0.8'}

  cac@6.7.14:
    resolution: {integrity: sha512-b6Ilus+c3RrdDk+JhLKUAQfzzgLEPy6wcXqS7f/xe1EETvsDP6GORG7SFuOs6cID5YkqchW/LXZbX5bc8j7ZcQ==}
    engines: {node: '>=8'}

  call-bind-apply-helpers@1.0.2:
    resolution: {integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==}
    engines: {node: '>= 0.4'}

  call-bound@1.0.4:
    resolution: {integrity: sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==}
    engines: {node: '>= 0.4'}

  chai@5.2.0:
    resolution: {integrity: sha512-mCuXncKXk5iCLhfhwTc0izo0gtEmpz5CtG2y8GiOINBlMVS6v8TMRc5TaLWKS6692m9+dVVfzgeVxR5UxWHTYw==}
    engines: {node: '>=12'}

  check-error@2.1.1:
    resolution: {integrity: sha512-OAlb+T7V4Op9OwdkjmguYRqncdlx5JiofwOAUkmTF+jNdHwzTaTs4sRAGpzLF3oOz5xAyDGrPgeIDFQmDOTiJw==}
    engines: {node: '>= 16'}

  color-convert@2.0.1:
    resolution: {integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==}
    engines: {node: '>=7.0.0'}

  color-name@1.1.4:
    resolution: {integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==}

  commander@14.0.0:
    resolution: {integrity: sha512-2uM9rYjPvyq39NwLRqaiLtWHyDC1FvryJDa2ATTVims5YAS4PupsEQsDvP14FqhFr0P49CYDugi59xaxJlTXRA==}
    engines: {node: '>=20'}

  content-disposition@1.0.0:
    resolution: {integrity: sha512-Au9nRL8VNUut/XSzbQA38+M78dzP4D+eqg3gfJHMIHHYa3bg067xj1KxMUWj+VULbiZMowKngFFbKczUrNJ1mg==}
    engines: {node: '>= 0.6'}

  content-type@1.0.5:
    resolution: {integrity: sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==}
    engines: {node: '>= 0.6'}

  cookie-signature@1.2.2:
    resolution: {integrity: sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==}
    engines: {node: '>=6.6.0'}

  cookie@0.7.2:
    resolution: {integrity: sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==}
    engines: {node: '>= 0.6'}

  cors@2.8.5:
    resolution: {integrity: sha512-KIHbLJqu73RGr/hnbrO9uBeixNGuvSQjul/jdFvS/KFSIH1hWVd1ng7zOHx+YrEfInLG7q4n6GHQ9cDtxv/P6g==}
    engines: {node: '>= 0.10'}

  cross-spawn@7.0.6:
    resolution: {integrity: sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==}
    engines: {node: '>= 8'}

  debug@4.4.1:
    resolution: {integrity: sha512-KcKCqiftBJcZr++7ykoDIEwSa3XWowTfNPo92BYxjXiyYEVrUQh2aLyhxBCwww+heortUFxEJYcRzosstTEBYQ==}
    engines: {node: '>=6.0'}
    peerDependencies:
      supports-color: '*'
    peerDependenciesMeta:
      supports-color:
        optional: true

  deep-eql@5.0.2:
    resolution: {integrity: sha512-h5k/5U50IJJFpzfL6nO9jaaumfjO/f2NjK/oYB2Djzm4p9L+3T9qWpZqZ2hAbLPuuYq9wrU08WQyBTL5GbPk5Q==}
    engines: {node: '>=6'}

  depd@2.0.0:
    resolution: {integrity: sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==}
    engines: {node: '>= 0.8'}

  dunder-proto@1.0.1:
    resolution: {integrity: sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==}
    engines: {node: '>= 0.4'}

  eastasianwidth@0.2.0:
    resolution: {integrity: sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==}

  ee-first@1.1.1:
    resolution: {integrity: sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==}

  emoji-regex@8.0.0:
    resolution: {integrity: sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==}

  emoji-regex@9.2.2:
    resolution: {integrity: sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==}

  encodeurl@2.0.0:
    resolution: {integrity: sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==}
    engines: {node: '>= 0.8'}

  es-define-property@1.0.1:
    resolution: {integrity: sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==}
    engines: {node: '>= 0.4'}

  es-errors@1.3.0:
    resolution: {integrity: sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==}
    engines: {node: '>= 0.4'}

  es-module-lexer@1.7.0:
    resolution: {integrity: sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==}

  es-object-atoms@1.1.1:
    resolution: {integrity: sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==}
    engines: {node: '>= 0.4'}

  esbuild@0.25.5:
    resolution: {integrity: sha512-P8OtKZRv/5J5hhz0cUAdu/cLuPIKXpQl1R9pZtvmHWQvrAUVd0UNIPT4IB4W3rNOqVO0rlqHmCIbSwxh/c9yUQ==}
    engines: {node: '>=18'}
    hasBin: true

  escape-html@1.0.3:
    resolution: {integrity: sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==}

  estree-walker@3.0.3:
    resolution: {integrity: sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==}

  etag@1.8.1:
    resolution: {integrity: sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==}
    engines: {node: '>= 0.6'}

  eventsource-parser@3.0.2:
    resolution: {integrity: sha512-6RxOBZ/cYgd8usLwsEl+EC09Au/9BcmCKYF2/xbml6DNczf7nv0MQb+7BA2F+li6//I+28VNlQR37XfQtcAJuA==}
    engines: {node: '>=18.0.0'}

  eventsource@3.0.7:
    resolution: {integrity: sha512-CRT1WTyuQoD771GW56XEZFQ/ZoSfWid1alKGDYMmkt2yl8UXrVR4pspqWNEcqKvVIzg6PAltWjxcSSPrboA4iA==}
    engines: {node: '>=18.0.0'}

  expect-type@1.2.1:
    resolution: {integrity: sha512-/kP8CAwxzLVEeFrMm4kMmy4CCDlpipyA7MYLVrdJIkV0fYF0UaigQHRsxHiuY/GEea+bh4KSv3TIlgr+2UL6bw==}
    engines: {node: '>=12.0.0'}

  express-rate-limit@7.5.1:
    resolution: {integrity: sha512-7iN8iPMDzOMHPUYllBEsQdWVB6fPDMPqwjBaFrgr4Jgr/+okjvzAy+UHlYYL/Vs0OsOrMkwS6PJDkFlJwoxUnw==}
    engines: {node: '>= 16'}
    peerDependencies:
      express: '>= 4.11'

  express@5.1.0:
    resolution: {integrity: sha512-DT9ck5YIRU+8GYzzU5kT3eHGA5iL+1Zd0EutOmTE9Dtk+Tvuzd23VBU+ec7HPNSTxXYO55gPV/hq4pSBJDjFpA==}
    engines: {node: '>= 18'}

  fdir@6.4.6:
    resolution: {integrity: sha512-hiFoqpyZcfNm1yc4u8oWCf9A2c4D3QjCrks3zmoVKVxpQRzmPNar1hUJcBG2RQHvEVGDN+Jm81ZheVLAQMK6+w==}
    peerDependencies:
      picomatch: ^3 || ^4
    peerDependenciesMeta:
      picomatch:
        optional: true

  fflate@0.8.2:
    resolution: {integrity: sha512-cPJU47OaAoCbg0pBvzsgpTPhmhqI5eJjh/JIu8tPj5q+T7iLvW/JAYUqmE7KOB4R1ZyEhzBaIQpQpardBF5z8A==}

  finalhandler@2.1.0:
    resolution: {integrity: sha512-/t88Ty3d5JWQbWYgaOGCCYfXRwV1+be02WqYYlL6h0lEiUAMPM8o8qKGO01YIkOHzka2up08wvgYD0mDiI+q3Q==}
    engines: {node: '>= 0.8'}

  flatted@3.3.3:
    resolution: {integrity: sha512-GX+ysw4PBCz0PzosHDepZGANEuFCMLrnRTiEy9McGjmkCQYwRq4A/X786G/fjM/+OjsWSU1ZrY5qyARZmO/uwg==}

  foreground-child@3.3.1:
    resolution: {integrity: sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==}
    engines: {node: '>=14'}

  forwarded@0.2.0:
    resolution: {integrity: sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==}
    engines: {node: '>= 0.6'}

  fresh@2.0.0:
    resolution: {integrity: sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==}
    engines: {node: '>= 0.8'}

  fsevents@2.3.3:
    resolution: {integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]

  function-bind@1.1.2:
    resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}

  get-intrinsic@1.3.0:
    resolution: {integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==}
    engines: {node: '>= 0.4'}

  get-proto@1.0.1:
    resolution: {integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==}
    engines: {node: '>= 0.4'}

  glob@11.0.3:
    resolution: {integrity: sha512-2Nim7dha1KVkaiF4q6Dj+ngPPMdfvLJEOpZk/jKiUAkqKebpGAWQXAq9z1xu9HKu5lWfqw/FASuccEjyznjPaA==}
    engines: {node: 20 || >=22}
    hasBin: true

  gopd@1.2.0:
    resolution: {integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==}
    engines: {node: '>= 0.4'}

  has-symbols@1.1.0:
    resolution: {integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==}
    engines: {node: '>= 0.4'}

  hasown@2.0.2:
    resolution: {integrity: sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==}
    engines: {node: '>= 0.4'}

  http-errors@2.0.0:
    resolution: {integrity: sha512-FtwrG/euBzaEjYeRqOgly7G0qviiXoJWnvEH2Z1plBdXgbyjv34pHTSb9zoeHMyDy33+DWy5Wt9Wo+TURtOYSQ==}
    engines: {node: '>= 0.8'}

  iconv-lite@0.6.3:
    resolution: {integrity: sha512-4fCk79wshMdzMp2rH06qWrJE4iolqLhCUH+OiuIgU++RB0+94NlDL81atO7GX55uUKueo0txHNtvEyI6D7WdMw==}
    engines: {node: '>=0.10.0'}

  inherits@2.0.4:
    resolution: {integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==}

  ipaddr.js@1.9.1:
    resolution: {integrity: sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==}
    engines: {node: '>= 0.10'}

  is-fullwidth-code-point@3.0.0:
    resolution: {integrity: sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==}
    engines: {node: '>=8'}

  is-promise@4.0.0:
    resolution: {integrity: sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==}

  isexe@2.0.0:
    resolution: {integrity: sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==}

  jackspeak@4.1.1:
    resolution: {integrity: sha512-zptv57P3GpL+O0I7VdMJNBZCu+BPHVQUk55Ft8/QCJjTVxrnJHuVuX/0Bl2A6/+2oyR/ZMEuFKwmzqqZ/U5nPQ==}
    engines: {node: 20 || >=22}

  jintr@3.3.1:
    resolution: {integrity: sha512-nnOzyhf0SLpbWuZ270Omwbj5LcXUkTcZkVnK8/veJXtSZOiATM5gMZMdmzN75FmTyj+NVgrGaPdH12zIJ24oIA==}

  js-tokens@9.0.1:
    resolution: {integrity: sha512-mxa9E9ITFOt0ban3j6L5MpjwegGz6lBQmM1IJkWeBZGcMxto50+eWdjC/52xDbS2vy0k7vIMK0Fe2wfL9OQSpQ==}

  loupe@3.1.4:
    resolution: {integrity: sha512-wJzkKwJrheKtknCOKNEtDK4iqg/MxmZheEMtSTYvnzRdEYaZzmgH976nenp8WdJRdx5Vc1X/9MO0Oszl6ezeXg==}

  lru-cache@11.1.0:
    resolution: {integrity: sha512-QIXZUBJUx+2zHUdQujWejBkcD9+cs94tLn0+YL8UrCh+D5sCXZ4c7LaEH48pNwRY3MLDgqUFyhlCyjJPf1WP0A==}
    engines: {node: 20 || >=22}

  magic-string@0.30.17:
    resolution: {integrity: sha512-sNPKHvyjVf7gyjwS4xGTaW/mCnF8wnjtifKBEhxfZ7E/S8tQ0rssrwGNn6q8JH/ohItJfSQp9mBtQYuTlH5QnA==}

  math-intrinsics@1.1.0:
    resolution: {integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==}
    engines: {node: '>= 0.4'}

  media-typer@1.1.0:
    resolution: {integrity: sha512-aisnrDP4GNe06UcKFnV5bfMNPBUw4jsLGaWwWfnH3v02GnBuXX2MCVn5RbrWo0j3pczUilYblq7fQ7Nw2t5XKw==}
    engines: {node: '>= 0.8'}

  merge-descriptors@2.0.0:
    resolution: {integrity: sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==}
    engines: {node: '>=18'}

  mime-db@1.54.0:
    resolution: {integrity: sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==}
    engines: {node: '>= 0.6'}

  mime-types@3.0.1:
    resolution: {integrity: sha512-xRc4oEhT6eaBpU1XF7AjpOFD+xQmXNB5OVKwp4tqCuBpHLS/ZbBDrc07mYTDqVMg6PfxUjjNp85O6Cd2Z/5HWA==}
    engines: {node: '>= 0.6'}

  minimatch@10.0.3:
    resolution: {integrity: sha512-IPZ167aShDZZUMdRk66cyQAW3qr0WzbHkPdMYa8bzZhlHhO3jALbKdxcaak7W9FfT2rZNpQuUu4Od7ILEpXSaw==}
    engines: {node: 20 || >=22}

  minipass@7.1.2:
    resolution: {integrity: sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==}
    engines: {node: '>=16 || 14 >=14.17'}

  mrmime@2.0.1:
    resolution: {integrity: sha512-Y3wQdFg2Va6etvQ5I82yUhGdsKrcYox6p7FfL1LbK2J4V01F9TGlepTIhnK24t7koZibmg82KGglhA1XK5IsLQ==}
    engines: {node: '>=10'}

  ms@2.1.3:
    resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}

  nanoid@3.3.11:
    resolution: {integrity: sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==}
    engines: {node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1}
    hasBin: true

  negotiator@1.0.0:
    resolution: {integrity: sha512-8Ofs/AUQh8MaEcrlq5xOX0CQ9ypTF5dl78mjlMNfOK08fzpgTHQRQPBxcPlEtIw0yRpws+Zo/3r+5WRby7u3Gg==}
    engines: {node: '>= 0.6'}

  object-assign@4.1.1:
    resolution: {integrity: sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==}
    engines: {node: '>=0.10.0'}

  object-inspect@1.13.4:
    resolution: {integrity: sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==}
    engines: {node: '>= 0.4'}

  on-finished@2.4.1:
    resolution: {integrity: sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==}
    engines: {node: '>= 0.8'}

  once@1.4.0:
    resolution: {integrity: sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==}

  package-json-from-dist@1.0.1:
    resolution: {integrity: sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==}

  parseurl@1.3.3:
    resolution: {integrity: sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==}
    engines: {node: '>= 0.8'}

  path-key@3.1.1:
    resolution: {integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==}
    engines: {node: '>=8'}

  path-scurry@2.0.0:
    resolution: {integrity: sha512-ypGJsmGtdXUOeM5u93TyeIEfEhM6s+ljAhrk5vAvSx8uyY/02OvrZnA0YNGUrPXfpJMgI1ODd3nwz8Npx4O4cg==}
    engines: {node: 20 || >=22}

  path-to-regexp@8.2.0:
    resolution: {integrity: sha512-TdrF7fW9Rphjq4RjrW0Kp2AW0Ahwu9sRGTkS6bvDi0SCwZlEZYmcfDbEsTz8RVk0EHIS/Vd1bv3JhG+1xZuAyQ==}
    engines: {node: '>=16'}

  pathe@2.0.3:
    resolution: {integrity: sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==}

  pathval@2.0.0:
    resolution: {integrity: sha512-vE7JKRyES09KiunauX7nd2Q9/L7lhok4smP9RZTDeD4MVs72Dp2qNFVz39Nz5a0FVEW0BJR6C0DYrq6unoziZA==}
    engines: {node: '>= 14.16'}

  picocolors@1.1.1:
    resolution: {integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==}

  picomatch@4.0.2:
    resolution: {integrity: sha512-M7BAV6Rlcy5u+m6oPhAPFgJTzAioX/6B0DxyvDlo9l8+T3nLKbrczg2WLUyzd45L8RqfUMyGPzekbMvX2Ldkwg==}
    engines: {node: '>=12'}

  pkce-challenge@4.1.0:
    resolution: {integrity: sha512-ZBmhE1C9LcPoH9XZSdwiPtbPHZROwAnMy+kIFQVrnMCxY4Cudlz3gBOpzilgc0jOgRaiT3sIWfpMomW2ar2orQ==}
    engines: {node: '>=16.20.0'}

  postcss@8.5.6:
    resolution: {integrity: sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==}
    engines: {node: ^10 || ^12 || >=14}

  proxy-addr@2.0.7:
    resolution: {integrity: sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==}
    engines: {node: '>= 0.10'}

  qs@6.14.0:
    resolution: {integrity: sha512-YWWTjgABSKcvs/nWBi9PycY/JiPJqOD4JA6o9Sej2AtvSGarXxKC3OQSk4pAarbdQlKAh5D4FCQkJNkW+GAn3w==}
    engines: {node: '>=0.6'}

  range-parser@1.2.1:
    resolution: {integrity: sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==}
    engines: {node: '>= 0.6'}

  raw-body@3.0.0:
    resolution: {integrity: sha512-RmkhL8CAyCRPXCE28MMH0z2PNWQBNk2Q09ZdxM9IOOXwxwZbN+qbWaatPkdkWIKL2ZVDImrN/pK5HTRz2PcS4g==}
    engines: {node: '>= 0.8'}

  rimraf@6.0.1:
    resolution: {integrity: sha512-9dkvaxAsk/xNXSJzMgFqqMCuFgt2+KsOFek3TMLfo8NCPfWpBmqwyNn5Y+NX56QUYfCtsyhF3ayiboEoUmJk/A==}
    engines: {node: 20 || >=22}
    hasBin: true

  rollup@4.44.0:
    resolution: {integrity: sha512-qHcdEzLCiktQIfwBq420pn2dP+30uzqYxv9ETm91wdt2R9AFcWfjNAmje4NWlnCIQ5RMTzVf0ZyisOKqHR6RwA==}
    engines: {node: '>=18.0.0', npm: '>=8.0.0'}
    hasBin: true

  router@2.2.0:
    resolution: {integrity: sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==}
    engines: {node: '>= 18'}

  safe-buffer@5.2.1:
    resolution: {integrity: sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==}

  safer-buffer@2.1.2:
    resolution: {integrity: sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==}

  send@1.2.0:
    resolution: {integrity: sha512-uaW0WwXKpL9blXE2o0bRhoL2EGXIrZxQ2ZQ4mgcfoBxdFmQold+qWsD2jLrfZ0trjKL6vOw0j//eAwcALFjKSw==}
    engines: {node: '>= 18'}

  serve-static@2.2.0:
    resolution: {integrity: sha512-61g9pCh0Vnh7IutZjtLGGpTA355+OPn2TyDv/6ivP2h/AdAVX9azsoxmg2/M6nZeQZNYBEwIcsne1mJd9oQItQ==}
    engines: {node: '>= 18'}

  setprototypeof@1.2.0:
    resolution: {integrity: sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==}

  shebang-command@2.0.0:
    resolution: {integrity: sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==}
    engines: {node: '>=8'}

  shebang-regex@3.0.0:
    resolution: {integrity: sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==}
    engines: {node: '>=8'}

  side-channel-list@1.0.0:
    resolution: {integrity: sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==}
    engines: {node: '>= 0.4'}

  side-channel-map@1.0.1:
    resolution: {integrity: sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==}
    engines: {node: '>= 0.4'}

  side-channel-weakmap@1.0.2:
    resolution: {integrity: sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==}
    engines: {node: '>= 0.4'}

  side-channel@1.1.0:
    resolution: {integrity: sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==}
    engines: {node: '>= 0.4'}

  siginfo@2.0.0:
    resolution: {integrity: sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==}

  signal-exit@4.1.0:
    resolution: {integrity: sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==}
    engines: {node: '>=14'}

  sirv@3.0.1:
    resolution: {integrity: sha512-FoqMu0NCGBLCcAkS1qA+XJIQTR6/JHfQXl+uGteNCQ76T91DMUjPa9xfmeqMY3z80nLSg9yQmNjK0Px6RWsH/A==}
    engines: {node: '>=18'}

  source-map-js@1.2.1:
    resolution: {integrity: sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==}
    engines: {node: '>=0.10.0'}

  stackback@0.0.2:
    resolution: {integrity: sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==}

  statuses@2.0.1:
    resolution: {integrity: sha512-RwNA9Z/7PrK06rYLIzFMlaF+l73iwpzsqRIFgbMLbTcLD6cOao82TaWefPXQvB2fOC4AjuYSEndS7N/mTCbkdQ==}
    engines: {node: '>= 0.8'}

  statuses@2.0.2:
    resolution: {integrity: sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==}
    engines: {node: '>= 0.8'}

  std-env@3.9.0:
    resolution: {integrity: sha512-UGvjygr6F6tpH7o2qyqR6QYpwraIjKSdtzyBdyytFOHmPZY917kwdwLG0RbOjWOnKmnm3PeHjaoLLMie7kPLQw==}

  string-width@4.2.3:
    resolution: {integrity: sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==}
    engines: {node: '>=8'}

  string-width@5.1.2:
    resolution: {integrity: sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==}
    engines: {node: '>=12'}

  strip-ansi@6.0.1:
    resolution: {integrity: sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==}
    engines: {node: '>=8'}

  strip-ansi@7.1.0:
    resolution: {integrity: sha512-iq6eVVI64nQQTRYq2KtEg2d2uU7LElhTJwsH4YzIHZshxlgZms/wIc4VoDQTlG/IvVIrBKG06CrZnp0qv7hkcQ==}
    engines: {node: '>=12'}

  strip-literal@3.0.0:
    resolution: {integrity: sha512-TcccoMhJOM3OebGhSBEmp3UZ2SfDMZUEBdRA/9ynfLi8yYajyWX3JiXArcJt4Umh4vISpspkQIY8ZZoCqjbviA==}

  tinybench@2.9.0:
    resolution: {integrity: sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==}

  tinyexec@0.3.2:
    resolution: {integrity: sha512-KQQR9yN7R5+OSwaK0XQoj22pwHoTlgYqmUscPYoknOoWCWfj/5/ABTMRi69FrKU5ffPVh5QcFikpWJI/P1ocHA==}

  tinyglobby@0.2.14:
    resolution: {integrity: sha512-tX5e7OM1HnYr2+a2C/4V0htOcSQcoSTH9KgJnVvNm5zm/cyEWKJ7j7YutsH9CxMdtOkkLFy2AHrMci9IM8IPZQ==}
    engines: {node: '>=12.0.0'}

  tinypool@1.1.1:
    resolution: {integrity: sha512-Zba82s87IFq9A9XmjiX5uZA/ARWDrB03OHlq+Vw1fSdt0I+4/Kutwy8BP4Y/y/aORMo61FQ0vIb5j44vSo5Pkg==}
    engines: {node: ^18.0.0 || >=20.0.0}

  tinyrainbow@2.0.0:
    resolution: {integrity: sha512-op4nsTR47R6p0vMUUoYl/a+ljLFVtlfaXkLQmqfLR1qHma1h/ysYk4hEXZ880bf2CYgTskvTa/e196Vd5dDQXw==}
    engines: {node: '>=14.0.0'}

  tinyspy@4.0.3:
    resolution: {integrity: sha512-t2T/WLB2WRgZ9EpE4jgPJ9w+i66UZfDc8wHh0xrwiRNN+UwH98GIJkTeZqX9rg0i0ptwzqW+uYeIF0T4F8LR7A==}
    engines: {node: '>=14.0.0'}

  toidentifier@1.0.1:
    resolution: {integrity: sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==}
    engines: {node: '>=0.6'}

  totalist@3.0.1:
    resolution: {integrity: sha512-sf4i37nQ2LBx4m3wB74y+ubopq6W/dIzXg0FDGjsYnZHVa1Da8FH853wlL2gtUhg+xJXjfk3kUZS3BRoQeoQBQ==}
    engines: {node: '>=6'}

  tslib@2.8.1:
    resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

  type-is@2.0.1:
    resolution: {integrity: sha512-OZs6gsjF4vMp32qrCbiVSkrFmXtG/AZhY3t0iAMrMBiAZyV9oALtXO8hsrHbMXF9x6L3grlFuwW2oAz7cav+Gw==}
    engines: {node: '>= 0.6'}

  typescript@5.8.3:
    resolution: {integrity: sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==}
    engines: {node: '>=14.17'}
    hasBin: true

  undici-types@6.21.0:
    resolution: {integrity: sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==}

  undici@5.29.0:
    resolution: {integrity: sha512-raqeBD6NQK4SkWhQzeYKd1KmIG6dllBOTt55Rmkt4HtI9mwdWtJljnrXjAFUBLTSN67HWrOIZ3EPF4kjUw80Bg==}
    engines: {node: '>=14.0'}

  unpipe@1.0.0:
    resolution: {integrity: sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==}
    engines: {node: '>= 0.8'}

  vary@1.1.2:
    resolution: {integrity: sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==}
    engines: {node: '>= 0.8'}

  vite-node@3.2.4:
    resolution: {integrity: sha512-EbKSKh+bh1E1IFxeO0pg1n4dvoOTt0UDiXMd/qn++r98+jPO1xtJilvXldeuQ8giIB5IkpjCgMleHMNEsGH6pg==}
    engines: {node: ^18.0.0 || ^20.0.0 || >=22.0.0}
    hasBin: true

  vite@6.3.5:
    resolution: {integrity: sha512-cZn6NDFE7wdTpINgs++ZJ4N49W2vRp8LCKrn3Ob1kYNtOo21vfDoaV5GzBfLU4MovSAB8uNRm4jgzVQZ+mBzPQ==}
    engines: {node: ^18.0.0 || ^20.0.0 || >=22.0.0}
    hasBin: true
    peerDependencies:
      '@types/node': ^18.0.0 || ^20.0.0 || >=22.0.0
      jiti: '>=1.21.0'
      less: '*'
      lightningcss: ^1.21.0
      sass: '*'
      sass-embedded: '*'
      stylus: '*'
      sugarss: '*'
      terser: ^5.16.0
      tsx: ^4.8.1
      yaml: ^2.4.2
    peerDependenciesMeta:
      '@types/node':
        optional: true
      jiti:
        optional: true
      less:
        optional: true
      lightningcss:
        optional: true
      sass:
        optional: true
      sass-embedded:
        optional: true
      stylus:
        optional: true
      sugarss:
        optional: true
      terser:
        optional: true
      tsx:
        optional: true
      yaml:
        optional: true

  vitest@3.2.4:
    resolution: {integrity: sha512-LUCP5ev3GURDysTWiP47wRRUpLKMOfPh+yKTx3kVIEiu5KOMeqzpnYNsKyOoVrULivR8tLcks4+lga33Whn90A==}
    engines: {node: ^18.0.0 || ^20.0.0 || >=22.0.0}
    hasBin: true
    peerDependencies:
      '@edge-runtime/vm': '*'
      '@types/debug': ^4.1.12
      '@types/node': ^18.0.0 || ^20.0.0 || >=22.0.0
      '@vitest/browser': 3.2.4
      '@vitest/ui': 3.2.4
      happy-dom: '*'
      jsdom: '*'
    peerDependenciesMeta:
      '@edge-runtime/vm':
        optional: true
      '@types/debug':
        optional: true
      '@types/node':
        optional: true
      '@vitest/browser':
        optional: true
      '@vitest/ui':
        optional: true
      happy-dom:
        optional: true
      jsdom:
        optional: true

  which@2.0.2:
    resolution: {integrity: sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==}
    engines: {node: '>= 8'}
    hasBin: true

  why-is-node-running@2.3.0:
    resolution: {integrity: sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==}
    engines: {node: '>=8'}
    hasBin: true

  wrap-ansi@7.0.0:
    resolution: {integrity: sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==}
    engines: {node: '>=10'}

  wrap-ansi@8.1.0:
    resolution: {integrity: sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==}
    engines: {node: '>=12'}

  wrappy@1.0.2:
    resolution: {integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==}

  youtubei.js@14.0.0:
    resolution: {integrity: sha512-KAFttOw+9fwwBUvBc1T7KzMNBLczDOuN/dfote8BA9CABxgx8MPgV+vZWlowdDB6DnHjSUYppv+xvJ4VNBLK9A==}

  zod-to-json-schema@3.24.5:
    resolution: {integrity: sha512-/AuWwMP+YqiPbsJx5D6TfgRTc4kTLjsh5SOcd4bLsfUg2RcEXrFMJl1DGgdHy2aCfsIA/cr/1JM0xcB2GZji8g==}
    peerDependencies:
      zod: ^3.24.1

  zod@3.25.67:
    resolution: {integrity: sha512-idA2YXwpCdqUSKRCACDE6ItZD9TZzy3OZMtpfLoh6oPR47lipysRrJfjzMqFxQ3uJuUPyUeWe1r9vLH33xO/Qw==}

snapshots:

  '@bufbuild/protobuf@2.5.2': {}

  '@esbuild/aix-ppc64@0.25.5':
    optional: true

  '@esbuild/android-arm64@0.25.5':
    optional: true

  '@esbuild/android-arm@0.25.5':
    optional: true

  '@esbuild/android-x64@0.25.5':
    optional: true

  '@esbuild/darwin-arm64@0.25.5':
    optional: true

  '@esbuild/darwin-x64@0.25.5':
    optional: true

  '@esbuild/freebsd-arm64@0.25.5':
    optional: true

  '@esbuild/freebsd-x64@0.25.5':
    optional: true

  '@esbuild/linux-arm64@0.25.5':
    optional: true

  '@esbuild/linux-arm@0.25.5':
    optional: true

  '@esbuild/linux-ia32@0.25.5':
    optional: true

  '@esbuild/linux-loong64@0.25.5':
    optional: true

  '@esbuild/linux-mips64el@0.25.5':
    optional: true

  '@esbuild/linux-ppc64@0.25.5':
    optional: true

  '@esbuild/linux-riscv64@0.25.5':
    optional: true

  '@esbuild/linux-s390x@0.25.5':
    optional: true

  '@esbuild/linux-x64@0.25.5':
    optional: true

  '@esbuild/netbsd-arm64@0.25.5':
    optional: true

  '@esbuild/netbsd-x64@0.25.5':
    optional: true

  '@esbuild/openbsd-arm64@0.25.5':
    optional: true

  '@esbuild/openbsd-x64@0.25.5':
    optional: true

  '@esbuild/sunos-x64@0.25.5':
    optional: true

  '@esbuild/win32-arm64@0.25.5':
    optional: true

  '@esbuild/win32-ia32@0.25.5':
    optional: true

  '@esbuild/win32-x64@0.25.5':
    optional: true

  '@fastify/busboy@2.1.1': {}

  '@isaacs/balanced-match@4.0.1': {}

  '@isaacs/brace-expansion@5.0.0':
    dependencies:
      '@isaacs/balanced-match': 4.0.1

  '@isaacs/cliui@8.0.2':
    dependencies:
      string-width: 5.1.2
      string-width-cjs: string-width@4.2.3
      strip-ansi: 7.1.0
      strip-ansi-cjs: strip-ansi@6.0.1
      wrap-ansi: 8.1.0
      wrap-ansi-cjs: wrap-ansi@7.0.0

  '@jridgewell/sourcemap-codec@1.5.0': {}

  '@modelcontextprotocol/sdk@1.7.0':
    dependencies:
      content-type: 1.0.5
      cors: 2.8.5
      eventsource: 3.0.7
      express: 5.1.0
      express-rate-limit: 7.5.1(express@5.1.0)
      pkce-challenge: 4.1.0
      raw-body: 3.0.0
      zod: 3.25.67
      zod-to-json-schema: 3.24.5(zod@3.25.67)
    transitivePeerDependencies:
      - supports-color

  '@polka/url@1.0.0-next.29': {}

  '@rollup/rollup-android-arm-eabi@4.44.0':
    optional: true

  '@rollup/rollup-android-arm64@4.44.0':
    optional: true

  '@rollup/rollup-darwin-arm64@4.44.0':
    optional: true

  '@rollup/rollup-darwin-x64@4.44.0':
    optional: true

  '@rollup/rollup-freebsd-arm64@4.44.0':
    optional: true

  '@rollup/rollup-freebsd-x64@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm-gnueabihf@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm-musleabihf@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-arm64-musl@4.44.0':
    optional: true

  '@rollup/rollup-linux-loongarch64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-powerpc64le-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-riscv64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-riscv64-musl@4.44.0':
    optional: true

  '@rollup/rollup-linux-s390x-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-x64-gnu@4.44.0':
    optional: true

  '@rollup/rollup-linux-x64-musl@4.44.0':
    optional: true

  '@rollup/rollup-win32-arm64-msvc@4.44.0':
    optional: true

  '@rollup/rollup-win32-ia32-msvc@4.44.0':
    optional: true

  '@rollup/rollup-win32-x64-msvc@4.44.0':
    optional: true

  '@types/chai@5.2.2':
    dependencies:
      '@types/deep-eql': 4.0.2

  '@types/deep-eql@4.0.2': {}

  '@types/estree@1.0.8': {}

  '@types/node@20.19.1':
    dependencies:
      undici-types: 6.21.0

  '@vitest/expect@3.2.4':
    dependencies:
      '@types/chai': 5.2.2
      '@vitest/spy': 3.2.4
      '@vitest/utils': 3.2.4
      chai: 5.2.0
      tinyrainbow: 2.0.0

  '@vitest/mocker@3.2.4(vite@6.3.5(@types/node@20.19.1))':
    dependencies:
      '@vitest/spy': 3.2.4
      estree-walker: 3.0.3
      magic-string: 0.30.17
    optionalDependencies:
      vite: 6.3.5(@types/node@20.19.1)

  '@vitest/pretty-format@3.2.4':
    dependencies:
      tinyrainbow: 2.0.0

  '@vitest/runner@3.2.4':
    dependencies:
      '@vitest/utils': 3.2.4
      pathe: 2.0.3
      strip-literal: 3.0.0

  '@vitest/snapshot@3.2.4':
    dependencies:
      '@vitest/pretty-format': 3.2.4
      magic-string: 0.30.17
      pathe: 2.0.3

  '@vitest/spy@3.2.4':
    dependencies:
      tinyspy: 4.0.3

  '@vitest/ui@3.2.4(vitest@3.2.4)':
    dependencies:
      '@vitest/utils': 3.2.4
      fflate: 0.8.2
      flatted: 3.3.3
      pathe: 2.0.3
      sirv: 3.0.1
      tinyglobby: 0.2.14
      tinyrainbow: 2.0.0
      vitest: 3.2.4(@types/node@20.19.1)(@vitest/ui@3.2.4)

  '@vitest/utils@3.2.4':
    dependencies:
      '@vitest/pretty-format': 3.2.4
      loupe: 3.1.4
      tinyrainbow: 2.0.0

  accepts@2.0.0:
    dependencies:
      mime-types: 3.0.1
      negotiator: 1.0.0

  acorn@8.15.0: {}

  ansi-regex@5.0.1: {}

  ansi-regex@6.1.0: {}

  ansi-styles@4.3.0:
    dependencies:
      color-convert: 2.0.1

  ansi-styles@6.2.1: {}

  assertion-error@2.0.1: {}

  body-parser@2.2.0:
    dependencies:
      bytes: 3.1.2
      content-type: 1.0.5
      debug: 4.4.1
      http-errors: 2.0.0
      iconv-lite: 0.6.3
      on-finished: 2.4.1
      qs: 6.14.0
      raw-body: 3.0.0
      type-is: 2.0.1
    transitivePeerDependencies:
      - supports-color

  bytes@3.1.2: {}

  cac@6.7.14: {}

  call-bind-apply-helpers@1.0.2:
    dependencies:
      es-errors: 1.3.0
      function-bind: 1.1.2

  call-bound@1.0.4:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      get-intrinsic: 1.3.0

  chai@5.2.0:
    dependencies:
      assertion-error: 2.0.1
      check-error: 2.1.1
      deep-eql: 5.0.2
      loupe: 3.1.4
      pathval: 2.0.0

  check-error@2.1.1: {}

  color-convert@2.0.1:
    dependencies:
      color-name: 1.1.4

  color-name@1.1.4: {}

  commander@14.0.0: {}

  content-disposition@1.0.0:
    dependencies:
      safe-buffer: 5.2.1

  content-type@1.0.5: {}

  cookie-signature@1.2.2: {}

  cookie@0.7.2: {}

  cors@2.8.5:
    dependencies:
      object-assign: 4.1.1
      vary: 1.1.2

  cross-spawn@7.0.6:
    dependencies:
      path-key: 3.1.1
      shebang-command: 2.0.0
      which: 2.0.2

  debug@4.4.1:
    dependencies:
      ms: 2.1.3

  deep-eql@5.0.2: {}

  depd@2.0.0: {}

  dunder-proto@1.0.1:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-errors: 1.3.0
      gopd: 1.2.0

  eastasianwidth@0.2.0: {}

  ee-first@1.1.1: {}

  emoji-regex@8.0.0: {}

  emoji-regex@9.2.2: {}

  encodeurl@2.0.0: {}

  es-define-property@1.0.1: {}

  es-errors@1.3.0: {}

  es-module-lexer@1.7.0: {}

  es-object-atoms@1.1.1:
    dependencies:
      es-errors: 1.3.0

  esbuild@0.25.5:
    optionalDependencies:
      '@esbuild/aix-ppc64': 0.25.5
      '@esbuild/android-arm': 0.25.5
      '@esbuild/android-arm64': 0.25.5
      '@esbuild/android-x64': 0.25.5
      '@esbuild/darwin-arm64': 0.25.5
      '@esbuild/darwin-x64': 0.25.5
      '@esbuild/freebsd-arm64': 0.25.5
      '@esbuild/freebsd-x64': 0.25.5
      '@esbuild/linux-arm': 0.25.5
      '@esbuild/linux-arm64': 0.25.5
      '@esbuild/linux-ia32': 0.25.5
      '@esbuild/linux-loong64': 0.25.5
      '@esbuild/linux-mips64el': 0.25.5
      '@esbuild/linux-ppc64': 0.25.5
      '@esbuild/linux-riscv64': 0.25.5
      '@esbuild/linux-s390x': 0.25.5
      '@esbuild/linux-x64': 0.25.5
      '@esbuild/netbsd-arm64': 0.25.5
      '@esbuild/netbsd-x64': 0.25.5
      '@esbuild/openbsd-arm64': 0.25.5
      '@esbuild/openbsd-x64': 0.25.5
      '@esbuild/sunos-x64': 0.25.5
      '@esbuild/win32-arm64': 0.25.5
      '@esbuild/win32-ia32': 0.25.5
      '@esbuild/win32-x64': 0.25.5

  escape-html@1.0.3: {}

  estree-walker@3.0.3:
    dependencies:
      '@types/estree': 1.0.8

  etag@1.8.1: {}

  eventsource-parser@3.0.2: {}

  eventsource@3.0.7:
    dependencies:
      eventsource-parser: 3.0.2

  expect-type@1.2.1: {}

  express-rate-limit@7.5.1(express@5.1.0):
    dependencies:
      express: 5.1.0

  express@5.1.0:
    dependencies:
      accepts: 2.0.0
      body-parser: 2.2.0
      content-disposition: 1.0.0
      content-type: 1.0.5
      cookie: 0.7.2
      cookie-signature: 1.2.2
      debug: 4.4.1
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      finalhandler: 2.1.0
      fresh: 2.0.0
      http-errors: 2.0.0
      merge-descriptors: 2.0.0
      mime-types: 3.0.1
      on-finished: 2.4.1
      once: 1.4.0
      parseurl: 1.3.3
      proxy-addr: 2.0.7
      qs: 6.14.0
      range-parser: 1.2.1
      router: 2.2.0
      send: 1.2.0
      serve-static: 2.2.0
      statuses: 2.0.2
      type-is: 2.0.1
      vary: 1.1.2
    transitivePeerDependencies:
      - supports-color

  fdir@6.4.6(picomatch@4.0.2):
    optionalDependencies:
      picomatch: 4.0.2

  fflate@0.8.2: {}

  finalhandler@2.1.0:
    dependencies:
      debug: 4.4.1
      encodeurl: 2.0.0
      escape-html: 1.0.3
      on-finished: 2.4.1
      parseurl: 1.3.3
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  flatted@3.3.3: {}

  foreground-child@3.3.1:
    dependencies:
      cross-spawn: 7.0.6
      signal-exit: 4.1.0

  forwarded@0.2.0: {}

  fresh@2.0.0: {}

  fsevents@2.3.3:
    optional: true

  function-bind@1.1.2: {}

  get-intrinsic@1.3.0:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-define-property: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      function-bind: 1.1.2
      get-proto: 1.0.1
      gopd: 1.2.0
      has-symbols: 1.1.0
      hasown: 2.0.2
      math-intrinsics: 1.1.0

  get-proto@1.0.1:
    dependencies:
      dunder-proto: 1.0.1
      es-object-atoms: 1.1.1

  glob@11.0.3:
    dependencies:
      foreground-child: 3.3.1
      jackspeak: 4.1.1
      minimatch: 10.0.3
      minipass: 7.1.2
      package-json-from-dist: 1.0.1
      path-scurry: 2.0.0

  gopd@1.2.0: {}

  has-symbols@1.1.0: {}

  hasown@2.0.2:
    dependencies:
      function-bind: 1.1.2

  http-errors@2.0.0:
    dependencies:
      depd: 2.0.0
      inherits: 2.0.4
      setprototypeof: 1.2.0
      statuses: 2.0.1
      toidentifier: 1.0.1

  iconv-lite@0.6.3:
    dependencies:
      safer-buffer: 2.1.2

  inherits@2.0.4: {}

  ipaddr.js@1.9.1: {}

  is-fullwidth-code-point@3.0.0: {}

  is-promise@4.0.0: {}

  isexe@2.0.0: {}

  jackspeak@4.1.1:
    dependencies:
      '@isaacs/cliui': 8.0.2

  jintr@3.3.1:
    dependencies:
      acorn: 8.15.0

  js-tokens@9.0.1: {}

  loupe@3.1.4: {}

  lru-cache@11.1.0: {}

  magic-string@0.30.17:
    dependencies:
      '@jridgewell/sourcemap-codec': 1.5.0

  math-intrinsics@1.1.0: {}

  media-typer@1.1.0: {}

  merge-descriptors@2.0.0: {}

  mime-db@1.54.0: {}

  mime-types@3.0.1:
    dependencies:
      mime-db: 1.54.0

  minimatch@10.0.3:
    dependencies:
      '@isaacs/brace-expansion': 5.0.0

  minipass@7.1.2: {}

  mrmime@2.0.1: {}

  ms@2.1.3: {}

  nanoid@3.3.11: {}

  negotiator@1.0.0: {}

  object-assign@4.1.1: {}

  object-inspect@1.13.4: {}

  on-finished@2.4.1:
    dependencies:
      ee-first: 1.1.1

  once@1.4.0:
    dependencies:
      wrappy: 1.0.2

  package-json-from-dist@1.0.1: {}

  parseurl@1.3.3: {}

  path-key@3.1.1: {}

  path-scurry@2.0.0:
    dependencies:
      lru-cache: 11.1.0
      minipass: 7.1.2

  path-to-regexp@8.2.0: {}

  pathe@2.0.3: {}

  pathval@2.0.0: {}

  picocolors@1.1.1: {}

  picomatch@4.0.2: {}

  pkce-challenge@4.1.0: {}

  postcss@8.5.6:
    dependencies:
      nanoid: 3.3.11
      picocolors: 1.1.1
      source-map-js: 1.2.1

  proxy-addr@2.0.7:
    dependencies:
      forwarded: 0.2.0
      ipaddr.js: 1.9.1

  qs@6.14.0:
    dependencies:
      side-channel: 1.1.0

  range-parser@1.2.1: {}

  raw-body@3.0.0:
    dependencies:
      bytes: 3.1.2
      http-errors: 2.0.0
      iconv-lite: 0.6.3
      unpipe: 1.0.0

  rimraf@6.0.1:
    dependencies:
      glob: 11.0.3
      package-json-from-dist: 1.0.1

  rollup@4.44.0:
    dependencies:
      '@types/estree': 1.0.8
    optionalDependencies:
      '@rollup/rollup-android-arm-eabi': 4.44.0
      '@rollup/rollup-android-arm64': 4.44.0
      '@rollup/rollup-darwin-arm64': 4.44.0
      '@rollup/rollup-darwin-x64': 4.44.0
      '@rollup/rollup-freebsd-arm64': 4.44.0
      '@rollup/rollup-freebsd-x64': 4.44.0
      '@rollup/rollup-linux-arm-gnueabihf': 4.44.0
      '@rollup/rollup-linux-arm-musleabihf': 4.44.0
      '@rollup/rollup-linux-arm64-gnu': 4.44.0
      '@rollup/rollup-linux-arm64-musl': 4.44.0
      '@rollup/rollup-linux-loongarch64-gnu': 4.44.0
      '@rollup/rollup-linux-powerpc64le-gnu': 4.44.0
      '@rollup/rollup-linux-riscv64-gnu': 4.44.0
      '@rollup/rollup-linux-riscv64-musl': 4.44.0
      '@rollup/rollup-linux-s390x-gnu': 4.44.0
      '@rollup/rollup-linux-x64-gnu': 4.44.0
      '@rollup/rollup-linux-x64-musl': 4.44.0
      '@rollup/rollup-win32-arm64-msvc': 4.44.0
      '@rollup/rollup-win32-ia32-msvc': 4.44.0
      '@rollup/rollup-win32-x64-msvc': 4.44.0
      fsevents: 2.3.3

  router@2.2.0:
    dependencies:
      debug: 4.4.1
      depd: 2.0.0
      is-promise: 4.0.0
      parseurl: 1.3.3
      path-to-regexp: 8.2.0
    transitivePeerDependencies:
      - supports-color

  safe-buffer@5.2.1: {}

  safer-buffer@2.1.2: {}

  send@1.2.0:
    dependencies:
      debug: 4.4.1
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      fresh: 2.0.0
      http-errors: 2.0.0
      mime-types: 3.0.1
      ms: 2.1.3
      on-finished: 2.4.1
      range-parser: 1.2.1
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  serve-static@2.2.0:
    dependencies:
      encodeurl: 2.0.0
      escape-html: 1.0.3
      parseurl: 1.3.3
      send: 1.2.0
    transitivePeerDependencies:
      - supports-color

  setprototypeof@1.2.0: {}

  shebang-command@2.0.0:
    dependencies:
      shebang-regex: 3.0.0

  shebang-regex@3.0.0: {}

  side-channel-list@1.0.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4

  side-channel-map@1.0.1:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4

  side-channel-weakmap@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4
      side-channel-map: 1.0.1

  side-channel@1.1.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4
      side-channel-list: 1.0.0
      side-channel-map: 1.0.1
      side-channel-weakmap: 1.0.2

  siginfo@2.0.0: {}

  signal-exit@4.1.0: {}

  sirv@3.0.1:
    dependencies:
      '@polka/url': 1.0.0-next.29
      mrmime: 2.0.1
      totalist: 3.0.1

  source-map-js@1.2.1: {}

  stackback@0.0.2: {}

  statuses@2.0.1: {}

  statuses@2.0.2: {}

  std-env@3.9.0: {}

  string-width@4.2.3:
    dependencies:
      emoji-regex: 8.0.0
      is-fullwidth-code-point: 3.0.0
      strip-ansi: 6.0.1

  string-width@5.1.2:
    dependencies:
      eastasianwidth: 0.2.0
      emoji-regex: 9.2.2
      strip-ansi: 7.1.0

  strip-ansi@6.0.1:
    dependencies:
      ansi-regex: 5.0.1

  strip-ansi@7.1.0:
    dependencies:
      ansi-regex: 6.1.0

  strip-literal@3.0.0:
    dependencies:
      js-tokens: 9.0.1

  tinybench@2.9.0: {}

  tinyexec@0.3.2: {}

  tinyglobby@0.2.14:
    dependencies:
      fdir: 6.4.6(picomatch@4.0.2)
      picomatch: 4.0.2

  tinypool@1.1.1: {}

  tinyrainbow@2.0.0: {}

  tinyspy@4.0.3: {}

  toidentifier@1.0.1: {}

  totalist@3.0.1: {}

  tslib@2.8.1: {}

  type-is@2.0.1:
    dependencies:
      content-type: 1.0.5
      media-typer: 1.1.0
      mime-types: 3.0.1

  typescript@5.8.3: {}

  undici-types@6.21.0: {}

  undici@5.29.0:
    dependencies:
      '@fastify/busboy': 2.1.1

  unpipe@1.0.0: {}

  vary@1.1.2: {}

  vite-node@3.2.4(@types/node@20.19.1):
    dependencies:
      cac: 6.7.14
      debug: 4.4.1
      es-module-lexer: 1.7.0
      pathe: 2.0.3
      vite: 6.3.5(@types/node@20.19.1)
    transitivePeerDependencies:
      - '@types/node'
      - jiti
      - less
      - lightningcss
      - sass
      - sass-embedded
      - stylus
      - sugarss
      - supports-color
      - terser
      - tsx
      - yaml

  vite@6.3.5(@types/node@20.19.1):
    dependencies:
      esbuild: 0.25.5
      fdir: 6.4.6(picomatch@4.0.2)
      picomatch: 4.0.2
      postcss: 8.5.6
      rollup: 4.44.0
      tinyglobby: 0.2.14
    optionalDependencies:
      '@types/node': 20.19.1
      fsevents: 2.3.3

  vitest@3.2.4(@types/node@20.19.1)(@vitest/ui@3.2.4):
    dependencies:
      '@types/chai': 5.2.2
      '@vitest/expect': 3.2.4
      '@vitest/mocker': 3.2.4(vite@6.3.5(@types/node@20.19.1))
      '@vitest/pretty-format': 3.2.4
      '@vitest/runner': 3.2.4
      '@vitest/snapshot': 3.2.4
      '@vitest/spy': 3.2.4
      '@vitest/utils': 3.2.4
      chai: 5.2.0
      debug: 4.4.1
      expect-type: 1.2.1
      magic-string: 0.30.17
      pathe: 2.0.3
      picomatch: 4.0.2
      std-env: 3.9.0
      tinybench: 2.9.0
      tinyexec: 0.3.2
      tinyglobby: 0.2.14
      tinypool: 1.1.1
      tinyrainbow: 2.0.0
      vite: 6.3.5(@types/node@20.19.1)
      vite-node: 3.2.4(@types/node@20.19.1)
      why-is-node-running: 2.3.0
    optionalDependencies:
      '@types/node': 20.19.1
      '@vitest/ui': 3.2.4(vitest@3.2.4)
    transitivePeerDependencies:
      - jiti
      - less
      - lightningcss
      - msw
      - sass
      - sass-embedded
      - stylus
      - sugarss
      - supports-color
      - terser
      - tsx
      - yaml

  which@2.0.2:
    dependencies:
      isexe: 2.0.0

  why-is-node-running@2.3.0:
    dependencies:
      siginfo: 2.0.0
      stackback: 0.0.2

  wrap-ansi@7.0.0:
    dependencies:
      ansi-styles: 4.3.0
      string-width: 4.2.3
      strip-ansi: 6.0.1

  wrap-ansi@8.1.0:
    dependencies:
      ansi-styles: 6.2.1
      string-width: 5.1.2
      strip-ansi: 7.1.0

  wrappy@1.0.2: {}

  youtubei.js@14.0.0:
    dependencies:
      '@bufbuild/protobuf': 2.5.2
      jintr: 3.3.1
      tslib: 2.8.1
      undici: 5.29.0

  zod-to-json-schema@3.24.5(zod@3.25.67):
    dependencies:
      zod: 3.25.67

  zod@3.25.67: {}



================================================
FILE: smithery.yaml
================================================
# Smithery configuration file: https://smithery.ai/docs/config

startCommand:
  type: stdio
  configSchema:
    # JSON Schema defining the configuration options for the MCP.
    type: object
  commandFunction:
    # A function that produces the CLI command to start the MCP on stdio.
    |-
    config => ({ command: 'node', args: ['dist/index.js'] })


================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/*"],
  "exclude": ["node_modules"]
}



================================================
FILE: vitest.config.ts
================================================
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
    testTimeout: 30000, // 30 seconds for YouTube API calls
    hookTimeout: 30000,
  },
  esbuild: {
    target: "node18",
  },
});



================================================
FILE: .dockerignore
================================================
# Dependencies
node_modules
.pnpm-store

# Build output
dist

# Version control
.git
.gitignore

# IDE files
.vscode
.idea
*.swp
*.swo

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env
.env.*

# Test files
coverage
.nyc_output

# OS files
.DS_Store
Thumbs.db 


================================================
FILE: .npmignore
================================================
# Source
src/
tests/

# Config files
.eslintrc.json
.prettierrc
tsconfig.json
.dockerignore
Dockerfile
smithery.yaml

# Development files
.git/
.github/
.vscode/
.idea/
*.log
.DS_Store

# Dependencies
node_modules/
.pnpm-store/

# Test files
coverage/
.nyc_output/

# Environment
.env
.env.* 


================================================
FILE: .npmrc
================================================
engine-strict=true
strict-peer-dependencies=false


================================================
FILE: docs/KNOWN_ISSUES.md
================================================
# Known Issues

## Node.js Version Management with Claude App

### Issue Description

When using nvm (Node Version Manager) with multiple Node.js versions installed, Claude App exhibits specific behavior with node and npx commands.

#### Current Behavior
- Claude App defaults to using the lowest installed Node.js version
- Full path to node executable works (e.g., `/Users/username/.nvm/versions/node/v18.x.x/bin/node`)
- Full path to npx does not work effectively

#### Technical Analysis

1. Environment Variable Inheritance
   - Claude App is built on Electron, which has specific environment variable handling mechanisms
   - Electron initializes environment variables before command line flags and app code
   - Some environment variables are explicitly controlled by Electron:
     - `NODE_OPTIONS`: Limited support, some options are explicitly disallowed
     - `ELECTRON_RUN_AS_NODE`: Can be used to run as a normal Node.js process
   - The app may have its own environment isolation

2. Potential Root Causes
   - Electron's environment variable isolation may prevent proper npx path resolution
   - The way Electron handles `PATH` and executable resolution might differ from shell behavior
   - npx might be trying to use Electron's bundled Node.js version instead of the system one

#### Solution Found

1. Working Configuration:
```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": ["-y", "@gabriel3615/mcp-youtube-transcript"],
      "env": {
        "PATH": "/Users/username/.nvm/versions/node/v18.x.x/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    }
  }
}
```

2. Key Findings:
   - Using relative command name ("npx") works while full path does not
   - PATH environment variable must include complete system paths
   - No need for ELECTRON_RUN_AS_NODE when using this approach

3. Command Path Resolution Behavior:
   - Relative command names (e.g., "npx") work better than absolute paths
   - Possible reasons:
     - npx's internal Node.js environment dependencies
     - Electron's process creation mechanisms
     - Shell resolution and environment initialization
   - Using PATH allows proper environment setup for npm/npx tools

4. Best Practices:
   - Use relative command names in the configuration
   - Provide complete PATH including all system directories
   - Include the desired Node.js version bin directory first in PATH
   - Maintain full system paths for maximum compatibility:
     ```
     /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
     ```
     Reasons:
     - Different systems may have tools in different locations
     - Future dependencies might require additional system tools
     - Ensures compatibility across different Unix-like environments
     - Prevents potential issues with npm/npx dependencies

#### Current Status
- Issue Status: Resolved
- Solution: Use relative command name with PATH environment variable
- Impact: Successfully allows using specific Node.js version

#### Notes
- This solution maintains proper Node.js environment setup
- Works reliably across different Node.js versions
- May need adjustment if system paths change
- Document this approach for future reference
- While minimal PATH might work (e.g., just /bin for sh), full system paths are recommended for better compatibility

We will keep this document updated if we discover any additional insights or improvements. 


================================================
FILE: src/cli.ts
================================================
#!/usr/bin/env node

import { Command } from "commander";
import {
  YouTubeTranscriptFetcher,
  YouTubeUtils,
  YouTubeTranscriptError,
} from "./youtube/index.js";
import fs from "fs";
import path from "path";

const program = new Command();

program
  .name("youtube-transcript")
  .description("Extract transcripts from YouTube videos")
  .version("1.0.0");

program
  .command("transcript")
  .description("Extract transcripts from a YouTube video using the transcript ID")

  .argument("<url>", "YouTube video URL or ID")
  .option(
    "-l, --lang <language>",
    "Language code for transcripts (e.g. en, uk, ja, ru, zh)",
    "en"
  )
  .option("-p, --paragraphs", "Enable automatic paragraph breaks", false)
  .option(
    "-o, --output <file>",
    "Output file path (optional, defaults to stdout)"
  )
  .option("--json", "Output in JSON format", false)
  .action(
    async (
      url: string,
      options: {
        lang: string;
        paragraphs: boolean;
        output?: string;
        json: boolean;
      }
    ) => {
      try {
        console.error(`🎬 Processing YouTube video: ${url}`);

        // Extract video ID
        const videoId = YouTubeTranscriptFetcher.extractVideoId(url);
        console.error(`📝 Video ID: ${videoId}`);

        // Fetch transcripts
        const { transcripts, title } =
          await YouTubeTranscriptFetcher.fetchTranscripts(videoId, {
            lang: options.lang,
          });

        if (transcripts.length === 0) {
          throw new YouTubeTranscriptError(
            "No transcripts found for this video"
          );
        }

        console.error(`✅ Found ${transcripts.length} transcript segments`);
        console.error(`🎭 Title: ${title}`);
        console.error(`🌍 Language: ${options.lang}`);
        console.error(
          `⏱️  Total duration: ${YouTubeUtils.calculateTotalDuration(
            transcripts
          )} seconds`
        );

        let output: string;

        if (options.json) {
          // JSON output
          const jsonOutput = {
            videoId,
            title,
            language: options.lang,
            timestamp: new Date().toISOString(),
            totalDuration: YouTubeUtils.calculateTotalDuration(transcripts),
            transcriptCount: transcripts.length,
            transcripts: transcripts,
            formattedText: YouTubeUtils.formatTranscriptText(transcripts, {
              enableParagraphs: options.paragraphs,
            }),
          };
          output = JSON.stringify(jsonOutput, null, 2);
        } else {
          // Plain text output
          const formattedText = YouTubeUtils.formatTranscriptText(transcripts, {
            enableParagraphs: options.paragraphs,
          });
          output = `# ${title}\n\n${formattedText}`;
        }

        // Output to file or stdout
        if (options.output) {
          const outputPath = path.resolve(options.output);
          fs.writeFileSync(outputPath, output, "utf8");
          console.error(`💾 Transcript saved to: ${outputPath}`);
        } else {
          console.log(output);
        }

        console.error(
          `🎉 Successfully extracted transcript (${output.length} characters)`
        );
      } catch (error) {
        if (error instanceof YouTubeTranscriptError) {
          console.error(`❌ Error: ${error.message}`);
        } else {
          console.error(`❌ Unexpected error: ${(error as Error).message}`);
        }
        process.exit(1);
      }
    }
  );

program
  .command("download")
  .description("Download YouTube video using the transcript ID")
  .argument("<url>", "YouTube video URL or ID")
  .option(
    "-o, --output <file>",
    "Output file path (required)",
    "./"
  )
  .action(
    async (
      url: string,
      options: {
        output: string;
      }
    ) => {
      try {
        console.error(`🎬 Processing YouTube video download: ${url}`);

        // Extract video ID
        const videoId = YouTubeTranscriptFetcher.extractVideoId(url);
        console.error(`📝 Video ID: ${videoId}`);

        // Download the video
        console.error(`⏬ Downloading video...`);
        const outputPath = path.resolve(options.output);

        await YouTubeTranscriptFetcher.download(videoId, {
          output: outputPath,
        });

        console.error(`💾 Video saved to: ${outputPath}`);
        console.error(`🎉 Successfully downloaded video`);
      } catch (error) {
        if (error instanceof YouTubeTranscriptError) {
          console.error(`❌ Error: ${error.message}`);
        } else {
          console.error(`❌ Unexpected error: ${(error as Error).message}`);
        }
        process.exit(1);
      }
    }
  );

program.parse();



================================================
FILE: src/index.ts
================================================
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { YouTubeTranscriptFetcher, YouTubeUtils, YouTubeTranscriptError, TranscriptOptions, Transcript } from './youtube/index.js';
import { z } from "zod";

class YouTubeTranscriptExtractor {
  /**
   * Extracts YouTube video ID from various URL formats or direct ID input
   */
  extractYoutubeId(input: string): string {
    return YouTubeTranscriptFetcher.extractVideoId(input);
  }

  /**
   * Retrieves transcripts for a given video ID and language
   */
  async getTranscripts({ videoID, lang }: TranscriptOptions): Promise<{ transcripts: Transcript[], title: string }> {
    try {
      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoID, { lang });
      if (result.transcripts.length === 0) {
        throw new YouTubeTranscriptError('No transcripts found');
      }
      return result;
    } catch (error) {
      if (error instanceof YouTubeTranscriptError || error instanceof McpError) {
        throw error;
      }
      throw new YouTubeTranscriptError(`Failed to fetch transcripts: ${(error as Error).message}`);
    }
  }
}

class TranscriptServer {
  private extractor: YouTubeTranscriptExtractor;
  private server: McpServer;

  constructor() {
    this.extractor = new YouTubeTranscriptExtractor();
    this.server = new McpServer({
      name: "mcp-youtube-transcript",
      version: "0.0.1",
      description: "A server built on the Model Context Protocol (MCP) that enables direct downloading of YouTube video transcripts, supporting AI and video analysis workflows."
    });

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    process.on('SIGINT', async () => {
      await this.stop();
      process.exit(0);
    });
  }

  private setupTools(): void {
    this.server.tool(
      "get_transcripts",
      `Extract and process transcripts from a YouTube video.\n\n**Parameters:**\n- \`url\` (string, required): YouTube video URL or ID.\n- \`lang\` (string, optional, default 'en'): Language code for transcripts (e.g. 'en', 'uk', 'ja', 'ru', 'zh').\n- \`enableParagraphs\` (boolean, optional, default false): Enable automatic paragraph breaks.\n\n**IMPORTANT:** If the user does *not* specify a language *code*, **DO NOT** include the \`lang\` parameter in the tool call. Do not guess the language or use parts of the user query as the language code.`,
      {
        url: z.string().describe("YouTube video URL or ID"),
        lang: z.string().default("en").describe("Language code for transcripts, default 'en' (e.g. 'en', 'zh', 'ja', 'ru')"),
        enableParagraphs: z.boolean().default(false).describe("Enable automatic paragraph breaks, default `false`")
      },
      async (input) => {
        try {
          const videoId = this.extractor.extractYoutubeId(input.url);
          console.error(`Processing transcripts for video: ${videoId}`);
          
          const { transcripts, title } = await this.extractor.getTranscripts({ 
            videoID: videoId, 
            lang: input.lang 
          });
          
          // Format text with optional paragraph breaks
          const formattedText = YouTubeUtils.formatTranscriptText(transcripts, {
            enableParagraphs: input.enableParagraphs
          });
            
          console.error(`Successfully extracted transcripts for "${title}" (${formattedText.length} chars)`);
          
          return {
            content: [{
              type: "text",
              text: `# ${title}\n\n${formattedText}`,
              metadata: {
                videoId,
                title,
                language: input.lang,
                timestamp: new Date().toISOString(),
                charCount: formattedText.length,
                transcriptCount: transcripts.length,
                totalDuration: YouTubeUtils.calculateTotalDuration(transcripts),
                paragraphsEnabled: input.enableParagraphs
              }
            }]
          };
        } catch (error) {
          if (error instanceof YouTubeTranscriptError || error instanceof McpError) {
            throw error;
          }
          throw new YouTubeTranscriptError(`Failed to process transcripts: ${(error as Error).message}`);
        }
      }
    );

    this.server.tool(
      "download_video",
      `Download a YouTube video to a specified path.\n\n**Parameters:**\n- \`url\` (string, required): YouTube video URL or ID.\n- \`output\` (string, optional, default 'video.mp4'): The path to save the video file.`,
      {
        url: z.string().describe("YouTube video URL or ID"),
        outputPath: z.string().default("./").describe("Output file path"),
      },
      async (input) => {
        try {
          const videoId = this.extractor.extractYoutubeId(input.url);
          console.error(`Downloading video ${videoId} to ${input.outputPath}`);

          await YouTubeTranscriptFetcher.download(videoId, {
            output: input.outputPath,
          });

          return {
            content: [
              {
                type: "text",
                text: `Video successfully downloaded to ${input.outputPath}`,
                metadata: {
                  videoId,
                  path: input.outputPath,
                  timestamp: new Date().toISOString(),
                },
              },
            ],
          };
        } catch (error) {
          if (error instanceof YouTubeTranscriptError || error instanceof McpError) {
            throw error;
          }
          throw new YouTubeTranscriptError(`Failed to download video: ${(error as Error).message}`);
        }
      }
    );
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  async stop(): Promise<void> {
    await this.server.close();
  }
}

async function main() {
  try {
    const server = new TranscriptServer();
    await server.start();
  } catch (error) {
    console.error('Server error:', error);
    process.exit(1);
  }
}

main();


================================================
FILE: src/youtube/error.ts
================================================
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class YouTubeTranscriptError extends McpError {
  constructor(message: string) {
    super(ErrorCode.InternalError, message);
    this.name = "YouTubeTranscriptError";
  }
}



================================================
FILE: src/youtube/fetcher.ts
================================================
import {ErrorCode, McpError} from "@modelcontextprotocol/sdk/types.js";
import {ClientType, Innertube, Log, Utils} from "youtubei.js";
import {Transcript} from "./types.js";
import {YouTubeTranscriptError} from "./error.js";
import fs from "fs";

Log.setLevel(Log.Level.INFO);

export class YouTubeTranscriptFetcher {
  private static youtube: Innertube | null = null;

  /**
   * Initialize YouTube.js Innertube instance
   */
  private static async initializeYouTube(): Promise<Innertube> {
    if (!this.youtube) {
      try {
        this.youtube = await Innertube.create();
      } catch (error) {
        throw new YouTubeTranscriptError(
          `Failed to initialize YouTube client: ${(error as Error).message}`
        );
      }
    }
    return this.youtube;
  }

  /**
   * Extract video ID from YouTube URL or direct ID input
   */
  static extractVideoId(input: string): string {
    if (!input) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "YouTube URL or ID is required"
      );
    }

    // Check if input is a valid 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    // Try to parse as a URL
    try {
      const url = new URL(input);
      if (url.hostname === "youtu.be") {
        return url.pathname.slice(1);
      }
      if (url.hostname.includes("youtube.com")) {
        if (url.pathname.startsWith("/shorts/")) {
          return url.pathname.slice(8);
        }
        const videoId = url.searchParams.get("v");
        if (videoId) {
          return videoId;
        }
      }
    } catch (error) {
      // Not a valid URL, fall through to regex matching
    }

    // Fallback to regex for other URL formats
    const match = input.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    if (match) {
      return match[1];
    }

    throw new McpError(
      ErrorCode.InvalidParams,
      `Could not extract video ID from: ${input}`
    );
  }

  /**
   * Recursively find transcript segments in the response object.
   */
  private static _findTranscriptSegments(obj: any): any[] {
    if (!obj || typeof obj !== "object") {
      return [];
    }
    if (obj.initial_segments && Array.isArray(obj.initial_segments)) {
      return obj.initial_segments;
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const result = this._findTranscriptSegments(obj[key]);
        if (result.length > 0) {
          return result;
        }
      }
    }
    return [];
  }

  /**
   * Download a YouTube video
   */
  static async download(
      videoId: string,
      options: {
        output: string
      }
  ): Promise<void> {

    try {
      const identifier = this.extractVideoId(videoId);
      const youtube = await this.initializeYouTube();

      const info = await youtube.getInfo(identifier, ClientType.ANDROID);
      const title = info.basic_info?.title || "Untitled Video";

      const stream = await info.download({
        quality: 'best',
        client: ClientType.ANDROID
      });

      // 生成保存路径
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, "_");
      let outputPath: string;
      if (options.output) {
        // 如果 output 是目录，则拼接 title.mp4，否则直接用 output
        const stat = fs.existsSync(options.output) ? fs.statSync(options.output) : null;
        if (stat && stat.isDirectory()) {
          outputPath = `${options.output.replace(/\/$/, "")}/${safeTitle}.mp4`;
        } else {
          outputPath = options.output;
        }
      } else {
        outputPath = `./${safeTitle}.mp4`;
      }

      const file = fs.createWriteStream(outputPath);
      for await (const chunk of Utils.streamToIterable(stream)) {
        file.write(chunk);
      }
      file.end();

    } catch (error) {
      throw new YouTubeTranscriptError(
          `Failed to download video: ${(error as Error).message}`
      );
    }
  }

  /**
   * Fetch transcripts and video information using YouTube.js
   */
  static async fetchTranscripts(
    videoId: string,
    config?: { lang?: string }
  ): Promise<{ transcripts: Transcript[]; title: string }> {
    try {
      const identifier = this.extractVideoId(videoId);
      const youtube = await this.initializeYouTube();

      const info = await youtube.getInfo(identifier);
      const title = info.basic_info?.title || "Untitled Video";

      const transcriptInfo = await info.getTranscript();
      if (!transcriptInfo) {
        throw new YouTubeTranscriptError(
          `No transcripts available for video ${identifier}`
        );
      }

      // Check available languages
      const availableLanguages = transcriptInfo.languages || [];
      let finalTranscriptInfo = transcriptInfo;
      if (config?.lang) {
        // Try to find a language that matches more flexibly
        const matchingLang = availableLanguages.find(
            (lang: string) =>
                lang.toLowerCase().includes(config.lang!.toLowerCase()) ||
                config.lang!.toLowerCase().includes(lang.toLowerCase())
        );

        if (matchingLang) {
          try {
            finalTranscriptInfo = await transcriptInfo.selectLanguage(
              config.lang
            );
          } catch (error) {
            console.warn(
              `Could not select language ${config.lang}, using default: ${transcriptInfo.selectedLanguage}`
            );
          }
        } else {
          throw new YouTubeTranscriptError(
            `Language ${
              config.lang
            } not available for video ${identifier}. Available languages: ${transcriptInfo.languages.join(
              ", "
            )}`
          );
        }
      }

      const segments = this._findTranscriptSegments(finalTranscriptInfo);
      if (!segments || segments.length === 0) {
        throw new YouTubeTranscriptError(
          `Unable to parse transcript structure for video ${identifier}. The transcript data format may have changed.`
        );
      }

      const transcripts: Transcript[] = segments
        .map((segment: any) => {
          if (segment.type !== "TranscriptSegment") return null;

          const startMs = parseFloat(segment.start_ms || "0");
          const endMs = parseFloat(segment.end_ms || "0");
          const text = (
            segment.snippet?.runs?.[0]?.text ||
            segment.snippet?.text ||
            ""
          ).trim();

          if (!text) return null;

          return {
            text,
            lang: finalTranscriptInfo.selectedLanguage || "en",
            timestamp: startMs / 1000,
            duration: Math.max(0, (endMs - startMs) / 1000),
          } as Transcript;
        })
        .filter((t): t is Transcript => t !== null);

      if (transcripts.length === 0) {
        throw new YouTubeTranscriptError(
          `No transcript segments found for video ${identifier}. The video may not have captions or they may be disabled.`
        );
      }

      // The API sometimes returns segments out of order.
      transcripts.sort((a, b) => a.timestamp - b.timestamp);

      return { transcripts, title };
    } catch (error) {
      throw new YouTubeTranscriptError(
        `Failed to fetch transcripts: ${(error as Error).message}`
      );
    }
  }
}



================================================
FILE: src/youtube/index.ts
================================================
export * from "./types.js";
export * from "./error.js";
export * from "./utils.js";
export * from "./fetcher.js";


================================================
FILE: src/youtube/types.ts
================================================
export interface Transcript {
  text: string; // Transcript text
  lang?: string; // Language code
  timestamp: number; // Start time in seconds
  duration: number; // Duration in seconds
}

export interface TranscriptOptions {
  videoID: string; // Video ID or URL
  lang?: string; // Language code, default 'en'
}



================================================
FILE: src/youtube/utils.ts
================================================
import { Transcript } from "./types.js";

export class YouTubeUtils {
  /**
   * Format time (convert seconds to readable format)
   */
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  }

  /**
   * Calculate total duration in seconds
   */
  static calculateTotalDuration(items: Transcript[]): number {
    return items.reduce(
      (acc, item) => Math.max(acc, item.timestamp + item.duration),
      0
    );
  }

  /**
   * Decode HTML entities
   */
  static decodeHTML(text: string): string {
    const entities: { [key: string]: string } = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": "\"",
      "&#39;": "'",
      "&apos;": "'",
      "&#x27;": "'",
      "&#x2F;": "/",
      "&#x2f;": "/",
      "&#47;": "/",
      "&#xa0;": " ",
      "&nbsp;": " ",
    };

    return text.replace(/&[^;]+;/g, (match) => entities[match] || match).trim();
  }

  /**
   * Normalize text formatting (punctuation and spaces)
   */
  static normalizeText(text: string): string {
    return text
      .replace(/\n/g, " ")
      .replace(/\s*\.\s*\.\s*/g, ". ") // Fix multiple dots
      .replace(/\s*\.\s+/g, ". ") // Normalize spaces after dots
      .replace(/\s+/g, " ") // Normalize spaces
      .replace(/\s+([,.])/g, "$1") // Fix spaces before punctuation
      .replace(/\s*\?\s*/g, "? ") // Normalize question marks
      .replace(/\s*!\s*/g, "! ") // Normalize exclamation marks
      .trim();
  }

  /**
   * Format transcript text with optional paragraph breaks
   */
  static formatTranscriptText(
    transcripts: Transcript[],
    options: {
      enableParagraphs?: boolean;
      timeGapThreshold?: number;
      maxSentencesPerParagraph?: number;
    } = {}
  ): string {
    const {
      enableParagraphs = false,
      timeGapThreshold = 2,
      maxSentencesPerParagraph = 5,
    } = options;

    const processedTranscripts = transcripts
      .map((transcript) => this.decodeHTML(transcript.text))
      .filter((text) => text.length > 0);

    if (!enableParagraphs) {
      return this.normalizeText(processedTranscripts.join(" "));
    }

    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];
    let lastEndTime = 0;

    for (const transcript of transcripts) {
      const text = this.decodeHTML(transcript.text.trim());
      if (!text) continue;

      const timeGap = transcript.timestamp - lastEndTime;
      const previousText = currentParagraph[currentParagraph.length - 1] || "";

      const isTimeGap = timeGap > timeGapThreshold;
      const isNewSentence = previousText.endsWith(".") && /^[A-Z]/.test(text);
      const isParagraphFull =
        currentParagraph.length >= maxSentencesPerParagraph;

      const shouldStartNewParagraph =
        isTimeGap || isNewSentence || isParagraphFull;

      if (shouldStartNewParagraph && currentParagraph.length > 0) {
        paragraphs.push(this.normalizeText(currentParagraph.join(" ")));
        currentParagraph = [];
      }

      currentParagraph.push(text);
      lastEndTime = transcript.timestamp + transcript.duration;
    }

    if (currentParagraph.length > 0) {
      paragraphs.push(this.normalizeText(currentParagraph.join(" ")));
    }

    return paragraphs.join("\n\n");
  }
}



================================================
FILE: tests/youtube.test.ts
================================================
import { describe, it, expect } from "vitest";
import * as fs from 'fs';
// @ts-ignore
import {YouTubeTranscriptError, YouTubeTranscriptFetcher, YouTubeUtils} from "../src/youtube";


describe("YouTubeTranscriptFetcher", () => {
  describe("extractVideoId", () => {
    it("should extract video ID from various YouTube URL formats", () => {
      const testCases = [
        {
          input: "https://www.youtube.com/watch?v=gzBS9eh-Eh4",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://www.youtube.com/watch?v=gzBS9eh-Eh4&t=65s",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://youtu.be/gzBS9eh-Eh4",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://youtu.be/gzBS9eh-Eh4?t=65",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "https://www.youtube.com/shorts/gzBS9eh-Eh4",
          expected: "gzBS9eh-Eh4",
        },
        {
          input: "gzBS9eh-Eh4", // Direct video ID
          expected: "gzBS9eh-Eh4",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeTranscriptFetcher.extractVideoId(input)).toBe(expected);
      });
    });

    it("should throw error for invalid inputs", () => {
      const invalidInputs = [
        "",
        "not-a-url",
        "https://example.com",
        "https://www.youtube.com/watch",
        "invalid-video-id",
      ];

      invalidInputs.forEach((input) => {
        expect(() => YouTubeTranscriptFetcher.extractVideoId(input)).toThrow();
      });
    });
  });

  describe("fetchTranscripts", () => {
    it("should fetch transcripts for a valid video with captions", async () => {
      // Using the test video from our earlier testing
      const videoId = "gzBS9eh-Eh4";

      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoId);

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.title).toBe("BITCOIN: MARKET IS BECOMING INSANE!!! 🚨🔥");
      expect(result.transcripts).toBeDefined();
      expect(Array.isArray(result.transcripts)).toBe(true);
      expect(result.transcripts.length).toBeGreaterThan(0);

      // Check transcript structure
      const firstTranscript = result.transcripts[0];

      expect(firstTranscript).toHaveProperty("text");
      expect(firstTranscript).toHaveProperty("timestamp");
      expect(firstTranscript).toHaveProperty("duration");
      expect(firstTranscript).toHaveProperty("lang");

      expect(typeof firstTranscript.text).toBe("string");
      expect(typeof firstTranscript.timestamp).toBe("number");
      expect(typeof firstTranscript.duration).toBe("number");
      expect(firstTranscript.text.length).toBeGreaterThan(0);
    }, 30000);

    it("should fetch transcripts with URL input", async () => {
      const videoUrl = "https://www.youtube.com/watch?v=gzBS9eh-Eh4&t=65s";

      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoUrl);

      expect(result).toBeDefined();
      expect(result.transcripts.length).toBeGreaterThan(0);
    }, 30000);

    it("should handle videos without transcripts gracefully", async () => {
      // Using a video ID that likely doesn't have captions
      // Note: This test might be flaky depending on the video
      const videoId = "invalid_video_id_123";

      await expect(
        YouTubeTranscriptFetcher.fetchTranscripts(videoId)
      ).rejects.toThrow();
    }, 30000);

    it("should validate transcript data integrity", async () => {
      const videoId = "gzBS9eh-Eh4";

      const result = await YouTubeTranscriptFetcher.fetchTranscripts(videoId);

      // Validate that transcripts are sorted by timestamp
      for (let i = 1; i < result.transcripts.length; i++) {
        expect(result.transcripts[i].timestamp).toBeGreaterThanOrEqual(
          result.transcripts[i - 1].timestamp
        );
      }

      // Validate that all transcripts have positive duration
      result.transcripts.forEach((transcript: { duration: any; timestamp: any; }) => {
        expect(transcript.duration).toBeGreaterThanOrEqual(0);
        expect(transcript.timestamp).toBeGreaterThanOrEqual(0);
      });
    }, 30000);
  });
});

describe("YouTubeUtils", () => {
  describe("formatTime", () => {
    it("should format time correctly", () => {
      const testCases = [
        { input: 0, expected: "00:00:00.000" },
        { input: 65.5, expected: "00:01:05.500" },
        { input: 3661.123, expected: "01:01:01.123" },
        { input: 7323.456, expected: "02:02:03.456" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeUtils.formatTime(input)).toBe(expected);
      });
    });
  });

  describe("calculateTotalDuration", () => {
    it("should calculate total duration correctly", () => {
      const transcripts = [
        { text: "test1", timestamp: 0, duration: 5, lang: "en" },
        { text: "test2", timestamp: 10, duration: 3, lang: "en" },
        { text: "test3", timestamp: 20, duration: 7, lang: "en" },
      ];

      const totalDuration = YouTubeUtils.calculateTotalDuration(transcripts);
      expect(totalDuration).toBe(27); // 20 + 7 = 27
    });

    it("should handle empty array", () => {
      expect(YouTubeUtils.calculateTotalDuration([])).toBe(0);
    });
  });

  describe("decodeHTML", () => {
    it("should decode HTML entities correctly", () => {
      const testCases = [
        { input: "&amp;", expected: "&" },
        { input: "&lt;script&gt;", expected: "<script>" },
        { input: "&quot;hello&quot;", expected: '"hello"' },
        { input: "normal text", expected: "normal text" },
        { input: "&amp;lt;test&amp;gt;", expected: "&lt;test&gt;" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeUtils.decodeHTML(input)).toBe(expected);
      });
    });
  });

  describe("normalizeText", () => {
    it("should normalize text formatting correctly", () => {
      const testCases = [
        {
          input: "Hello   world  .  This is   a test .",
          expected: "Hello world. This is a test.",
        },
        {
          input: "Text with\nnewlines\nand   spaces",
          expected: "Text with newlines and spaces",
        },
        {
          input: "Question ?  Answer !",
          expected: "Question? Answer!",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(YouTubeUtils.normalizeText(input)).toBe(expected);
      });
    });
  });

  describe("formatTranscriptText", () => {
    const sampleTranscripts = [
      { text: "Hello world.", timestamp: 0, duration: 2, lang: "en" },
      { text: "This is a test.", timestamp: 2, duration: 3, lang: "en" },
      { text: "Another sentence.", timestamp: 8, duration: 2, lang: "en" }, // Gap > 2s
    ];

    it("should format transcript text without paragraphs", () => {
      const result = YouTubeUtils.formatTranscriptText(sampleTranscripts);
      expect(result).toBe("Hello world. This is a test. Another sentence.");
    });

    it("should format transcript text with paragraphs", () => {
      const result = YouTubeUtils.formatTranscriptText(sampleTranscripts, {
        enableParagraphs: true,
        timeGapThreshold: 2,
      });

      // Should create paragraph break due to time gap
      expect(result).toContain("\n\n");
    });

    it("should handle empty transcripts", () => {
      const result = YouTubeUtils.formatTranscriptText([]);
      expect(result).toBe("");
    });
  });
});

describe("Error Handling", () => {
  it("should create YouTubeTranscriptError correctly", () => {
    const error = new YouTubeTranscriptError("Test error message");
    expect(error.name).toBe("YouTubeTranscriptError");
    expect(error.message).toContain("Test error message");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("download", () => {
  it("should download a video successfully", async () => {
    // Using a short test video
    const videoId = "gzBS9eh-Eh4";
    const outputPath = "test-download.mp4";
    
    try {
      // Delete the file if it already exists
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      // Download the video
      await YouTubeTranscriptFetcher.download(videoId, {
        outputPath: outputPath,
        quality: "lowest", // Use lowest quality for faster test
      });
      
      // Check if file exists and has content
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
      
      // Clean up
      fs.unlinkSync(outputPath);
    } catch (error) {
      // Clean up in case of error
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      throw error;
    }
  }, 60000); // Increase timeout to 60 seconds for download
  
  it("should throw error for invalid video ID", async () => {
    const invalidVideoId = "invalid_video_id_123";
    const outputPath = "invalid-download.mp4";
    
    await expect(
      YouTubeTranscriptFetcher.download(invalidVideoId, {
        outputPath: outputPath,
      })
    ).rejects.toThrow();
    
    // Ensure no file was created
    expect(fs.existsSync(outputPath)).toBe(false);
  }, 30000);
  
  it("should handle download with URL input", async () => {
    const videoUrl = "https://www.youtube.com/watch?v=gzBS9eh-Eh4&t=65s";
    const outputPath = "url-download.mp4";
    
    try {
      // Delete the file if it already exists
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      // Download the video
      await YouTubeTranscriptFetcher.download(videoUrl, {
        outputPath: outputPath,
        quality: "lowest", // Use lowest quality for faster test
      });
      
      // Check if file exists and has content
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
      
      // Clean up
      fs.unlinkSync(outputPath);
    } catch (error) {
      // Clean up in case of error
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      throw error;
    }
  }, 60000);
});


================================================
FILE: .github/workflows/issue-manager.yml
================================================
name: Issue Manager

on:
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
  issues:
    types: [opened, reopened]

jobs:
  close-stale-issues:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - name: Check for stale issues
        uses: actions/stale@v9
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          stale-issue-message: 'This issue has been automatically closed due to inactivity. If you still need help, please feel free to reopen it.'
          stale-issue-label: 'stale'
          days-before-stale: 30
          days-before-close: 7
          exempt-issue-labels: 'pinned,help-wanted'
          only-issue-labels: ''
          operations-per-run: 30 


================================================
FILE: .github/workflows/publish.yml
================================================
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish-gpr:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@gabriel3615'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ github.token }}

  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
          scope: '@gabriel3615'
      - run: |
          echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" > .npmrc
          npm ci
          npm run build
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} 

