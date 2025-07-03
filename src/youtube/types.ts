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
