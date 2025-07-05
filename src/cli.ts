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
