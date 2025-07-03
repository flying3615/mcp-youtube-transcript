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
