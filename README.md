# MCP YouTube Transcript Server

[![smithery badge](https://smithery.ai/badge/@sinco-lab/mcp-youtube-transcript)](https://smithery.ai/server/@sinco-lab/mcp-youtube-transcript)

A Model Context Protocol server that enables retrieval of transcripts from YouTube videos. This server provides direct access to video transcripts through a simple interface, making it ideal for content analysis and processing.

<a href="https://glama.ai/mcp/servers/@sinco-lab/mcp-youtube-transcript">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@sinco-lab/mcp-youtube-transcript/badge" alt="mcp-youtube-transcript" />
</a>

## Features

- Extract transcripts from YouTube videos
- Support multiple languages
- Format text (continuous or paragraph mode)
- Retrieve video titles
- Timestamp and overlap detection
- Detailed metadata in responses
- Automatic paragraph segmentation
- HTML entity decoding
- Text normalization

## Installation

### Prerequisites

- Node.js 18 or higher

### Via Smithery

To install YouTube Transcript Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@sinco-lab/mcp-youtube-transcript):

```bash
npx -y @smithery/cli install @sinco-lab/mcp-youtube-transcript --client claude
```

## Usage

### Configuration

To use with Claude Desktop / Cursor / cline, add this server configuration:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": ["-y", "@sinco-lab/mcp-youtube-transcript"]
    }
  }
}
```

### Testing with MCP Inspector

The MCP Inspector is a powerful tool for testing and debugging MCP servers:

```bash
# Clone the repository
git clone https://github.com/sinco-lab/mcp-youtube-transcript.git
cd mcp-youtube-transcript

# Install dependencies
npm install

# Build the project
npm run build

# use npx
npx @modelcontextprotocol/inspector node "dist/index.js"

# After connecting, open http://localhost:5173 in your browser
# You can then use these commands in the Inspector web interface:

# 1. List available tools
clink `List Tools`

# 2. Test get_transcripts
url: "https://www.youtube.com/watch?v=AJpK3YTTKZ4"
lang: optional, default en
enableParagraphs: optional, default false
```

## API Reference

### Tool: get_transcripts

Retrieves transcripts from a YouTube video.

Parameters:
- `url` (string, required): YouTube video URL or ID
- `lang` (string, optional): Language code for transcripts (default: "en"). Supported options include `'en'`, `'uk'`, `'ja'`, `'ru'`, `'zh'`, etc.
- `enableParagraphs` (boolean, optional): Enable paragraph mode (default: false)

Response:
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
│ ├── youtube.ts          # YouTube transcript fetching logic and utilities
├── dist/                 # Compiled output
└── package.json
```

### Key Components

- `YouTubeTranscriptFetcher`: Core class for fetching transcripts from YouTube
- `YouTubeUtils`: Text processing, timestamp handling, and error utilities

## Error Handling

The server implements robust error handling for:
- Invalid video URLs or IDs
- Unavailable transcripts
- Language availability issues
- Network errors
- Timestamp overlaps
- Malformed transcripts
- Rate limiting
- Video availability

## Text Processing Features

- HTML entity decoding
- Punctuation normalization
- Space normalization
- Automatic paragraph detection based on:
  - Time gaps between segments
  - Sentence endings
  - Maximum paragraph length

## Related Projects

- [mcp-servers](https://github.com/modelcontextprotocol/servers): A Official list of MCP servers
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector): Official testing and debugging tool

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
