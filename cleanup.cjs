const fs = require('node:fs');

fs.rm('node_modules', { recursive: true, force: true }, err => {
  if (err) {
    throw err;
  }
});