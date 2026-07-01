import fs from 'fs';
import path from 'path';

// read the last 50 lines of dev_server log if available
// the logs are usually streamed to stdout but maybe there's a log file or I can just use curl to hit the API
// wait, I can just write a quick script to hit the API via localhost:3000 to see what it returns!

const http = require('http');
// wait, I don't have a valid JWT. I can mock the middleware in server.ts temporarily to bypass auth for admin!
