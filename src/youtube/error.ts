import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class YouTubeHelperError extends McpError {
  constructor(message: string) {
    super(ErrorCode.InternalError, message);
    this.name = "YouTubeHelperError";
  }
}
