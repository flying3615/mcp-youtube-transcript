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