#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { YouTubeTranscriptFetcher, YouTubeUtils, YouTubeHelperError, TranscriptOptions, Transcript } from './youtube/index.js';
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
        throw new YouTubeHelperError('No transcripts found');
      }
      return result;
    } catch (error) {
      if (error instanceof YouTubeHelperError || error instanceof McpError) {
        throw error;
      }
      throw new YouTubeHelperError(`Failed to fetch transcripts: ${(error as Error).message}`);
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
      `Extract and process transcripts from a YouTube video.\n\n**Parameters:**\n- \`url\` (string, required): YouTube video URL or ID.\n- \`lang\` (string, optional, default 'en'): Language code for transcripts (e.g. 'en', 'ja', 'ru', 'zh').\n- \`enableParagraphs\` (boolean, optional, default false): Enable automatic paragraph breaks.\n\n**IMPORTANT:** If the user does *not* specify a language *code*, **DO NOT** include the \`lang\` parameter in the tool call. Do not guess the language or use parts of the user query as the language code, if user specify the language, use the language code instead.`,
      {
        url: z.string().describe("YouTube video URL or ID"),
        lang: z.string().default("en").describe("Language code for transcripts, default 'en' (e.g. 'en', 'zh', 'ja', 'ru')"),
        enableParagraphs: z.boolean().default(false).describe("Enable automatic paragraph breaks, default `false`")
      },
      async (input) => {
        try {
          const videoId = this.extractor.extractYoutubeId(input.url);
          console.error(`Processing transcripts for video: ${videoId}`);

          const languageMap: Record<string, string> = {
            "en": "English",
            "ja": "Japanese",
            "ru": "Russian",
            "zh": "Chinese",
            "kr": "Korean",
            "fr": "French",
            "ge": "German",
          }

          if(!languageMap[input.lang]) {
            throw new YouTubeTranscriptError(`Unsupported language code: ${input.lang}. Supported codes are: ${Object.keys(languageMap).join(", ")}`);
          }
          
          const { transcripts, title } = await this.extractor.getTranscripts({ 
            videoID: videoId, 
            lang: languageMap[input.lang]
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
          if (error instanceof YouTubeHelperError || error instanceof McpError) {
            throw error;
          }
          throw new YouTubeHelperError(`Failed to process transcripts: ${(error as Error).message}`);
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
          if (error instanceof YouTubeHelperError || error instanceof McpError) {
            throw error;
          }
          throw new YouTubeHelperError(`Failed to download video: ${(error as Error).message}`);
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