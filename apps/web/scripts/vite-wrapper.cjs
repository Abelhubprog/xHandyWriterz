#!/usr/bin/env node

const path = require("path");
const Module = require("module");
const originalResolveFilename = Module._resolveFilename;
const stubPath = path.join(__dirname, "open-stub.cjs");

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "open") {
    return stubPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

process.env.BROWSER = process.env.BROWSER || "none";
process.env.OPEN = process.env.OPEN || "false";
process.env.CI = process.env.CI || "true";

try {
  require(require.resolve("vite/bin/vite.js"));
} catch (error) {
  console.error("[vite-wrapper] Failed to launch Vite", error);
  process.exit(1);
}
