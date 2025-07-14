import { describe, it, expect } from "vitest";
import * as fs from 'fs';
// @ts-ignore
import {YouTubeHelperError, YouTubeTranscriptFetcher, YouTubeUtils} from "../src/youtube";


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
    const error = new YouTubeHelperError("Test error message");
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