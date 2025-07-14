import {ErrorCode, McpError} from "@modelcontextprotocol/sdk/types.js";
import {ClientType, Innertube, Log, Utils} from "youtubei.js";
import {Transcript} from "./types.js";
import {YouTubeHelperError} from "./error.js";
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
        throw new YouTubeHelperError(
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
      throw new YouTubeHelperError(
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
        throw new YouTubeHelperError(
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
            finalTranscriptInfo = await transcriptInfo.selectLanguage(matchingLang);
          } catch (error) {
            console.warn(
              `Could not select language ${config.lang}, using default: ${transcriptInfo.selectedLanguage}`
            );
          }
        } else {
          throw new YouTubeHelperError(
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
        throw new YouTubeHelperError(
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
        throw new YouTubeHelperError(
          `No transcript segments found for video ${identifier}. The video may not have captions or they may be disabled.`
        );
      }

      // The API sometimes returns segments out of order.
      transcripts.sort((a, b) => a.timestamp - b.timestamp);

      return { transcripts, title };
    } catch (error) {
      throw new YouTubeHelperError(
        `Failed to fetch transcripts: ${(error as Error).message}`
      );
    }
  }
}
