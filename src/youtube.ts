import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Innertube } from "youtubei.js";

// Types
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

// Constants
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
const ADDITIONAL_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// Error handling
export class YouTubeTranscriptError extends McpError {
  constructor(message: string) {
    super(ErrorCode.InternalError, message);
    this.name = "YouTubeTranscriptError";
  }
}

// Utility functions
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
      "&quot;": '"',
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

    // Process each transcript text
    const processedTranscripts = transcripts
      .map((transcript) => this.decodeHTML(transcript.text))
      .filter((text) => text.length > 0);

    if (!enableParagraphs) {
      // Simple concatenation mode with normalized formatting
      return this.normalizeText(processedTranscripts.join(" "));
    }

    // Paragraph mode
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];
    let lastEndTime = 0;

    for (let i = 0; i < transcripts.length; i++) {
      const transcript = transcripts[i];
      const text = this.decodeHTML(transcript.text.trim());
      if (!text) continue;

      const timeGap = transcript.timestamp - lastEndTime;
      const previousText = currentParagraph[currentParagraph.length - 1] || "";

      const shouldStartNewParagraph =
        timeGap > timeGapThreshold ||
        (previousText.endsWith(".") && /^[A-Z]/.test(text)) ||
        currentParagraph.length >= maxSentencesPerParagraph;

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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Utility function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Rate limit error detection
const isRateLimitError = (html: string): boolean => {
  return (
    html.includes('class="g-recaptcha"') ||
    html.includes("sorry/index") ||
    html.includes("consent.youtube.com")
  );
};

// Main YouTube functionality using youtubei.js
export class YouTubeTranscriptFetcher {
  private static youtube: any = null;

  /**
   * Initialize YouTube.js Innertube instance
   */
  private static async initializeYouTube(): Promise<any> {
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

    // If input is an 11-digit video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    // Handle URL formats
    try {
      const url = new URL(input);
      if (url.hostname === "youtu.be") {
        return url.pathname.slice(1);
      } else if (url.hostname.includes("youtube.com")) {
        // Handle shorts URL format
        if (url.pathname.startsWith("/shorts/")) {
          return url.pathname.slice(8);
        }
        const videoId = url.searchParams.get("v");
        if (!videoId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid YouTube URL: ${input}`
          );
        }
        return videoId;
      }
    } catch (error) {
      // URL parsing failed, try regex matching
      const match = input.match(
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
      );
      if (match) {
        return match[1];
      }
    }

    throw new McpError(
      ErrorCode.InvalidParams,
      `Could not extract video ID from: ${input}`
    );
  }

  /**
   * Fetch video title using YouTube.js
   */
  private static async fetchVideoTitle(videoId: string): Promise<string> {
    try {
      const youtube = await this.initializeYouTube();
      const info = await youtube.getBasicInfo(videoId);
      return info.basic_info?.title || "Untitled Video";
    } catch (error) {
      console.error(`Failed to fetch video title: ${error}`);
      return "Untitled Video";
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

      // Get video info
      const info = await youtube.getInfo(identifier);
      const title = info.basic_info?.title || "Untitled Video";

      // Get transcript
      const transcriptInfo = await info.getTranscript();

      if (!transcriptInfo) {
        throw new YouTubeTranscriptError(
          `No transcripts available for video ${identifier}`
        );
      }

      // Check available languages
      const availableLanguages = transcriptInfo.languages || [];

      if (config?.lang && !availableLanguages.includes(config.lang)) {
        // Try to find a language that matches more flexibly
        const matchingLang = availableLanguages.find(
          (lang: string) =>
            lang.toLowerCase().includes(config.lang!.toLowerCase()) ||
            config.lang!.toLowerCase().includes(lang.toLowerCase())
        );

        if (!matchingLang) {
          throw new YouTubeTranscriptError(
            `Language ${
              config.lang
            } not available for video ${identifier}. Available languages: ${availableLanguages.join(
              ", "
            )}`
          );
        }
      }

      // Select language if specified
      let finalTranscriptInfo = transcriptInfo;
      if (config?.lang && config.lang !== transcriptInfo.selectedLanguage) {
        try {
          finalTranscriptInfo = await transcriptInfo.selectLanguage(
            config.lang
          );
        } catch (error) {
          console.warn(
            `Could not select language ${config.lang}, using default: ${transcriptInfo.selectedLanguage}`
          );
        }
      }

      // Parse transcript segments
      const transcripts: Transcript[] = [];

      // From the debug output, we can see the structure contains the segments
      // Let's extract them from the right location
      let segments: any[] = [];

      // The debug output shows the transcript structure is deeply nested
      // Let's try to find the segments in the actual response structure
      const findSegments = (obj: any): any[] => {
        if (!obj || typeof obj !== "object") return [];

        // Check if this object has initial_segments
        if (obj.initial_segments && Array.isArray(obj.initial_segments)) {
          return obj.initial_segments;
        }

        // Recursively search through all properties
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const result = findSegments(obj[key]);
            if (result.length > 0) {
              return result;
            }
          }
        }

        return [];
      };

      segments = findSegments(finalTranscriptInfo);

      if (segments && Array.isArray(segments) && segments.length > 0) {
        for (const segment of segments) {
          if (segment.type === "TranscriptSegment") {
            const startMs = parseFloat(segment.start_ms || "0");
            const endMs = parseFloat(segment.end_ms || "0");
            const text =
              segment.snippet?.runs?.[0]?.text || segment.snippet?.text || "";

            if (text.trim()) {
              transcripts.push({
                text: text.trim(),
                lang: finalTranscriptInfo.selectedLanguage || "en",
                timestamp: startMs / 1000, // Convert milliseconds to seconds
                duration: Math.max(0, (endMs - startMs) / 1000), // Duration in seconds
              });
            }
          }
        }
      } else {
        // Debug: Log the actual structure we received
        console.log(
          "Debug - Available keys in finalTranscriptInfo:",
          Object.keys(finalTranscriptInfo)
        );
        console.log(
          "Debug - Full transcript structure:",
          JSON.stringify(finalTranscriptInfo, null, 2)
        );
        throw new YouTubeTranscriptError(
          `Unable to parse transcript structure for video ${identifier}. The transcript data format may have changed.`
        );
      }

      // Sort by timestamp
      transcripts.sort((a, b) => a.timestamp - b.timestamp);

      if (transcripts.length === 0) {
        throw new YouTubeTranscriptError(
          `No transcript segments found for video ${identifier}. The video may not have captions or they may be disabled.`
        );
      }

      return { transcripts, title };
    } catch (error) {
      if (
        error instanceof YouTubeTranscriptError ||
        error instanceof McpError
      ) {
        throw error;
      }
      throw new YouTubeTranscriptError(
        `Failed to fetch transcripts: ${(error as Error).message}`
      );
    }
  }
}
