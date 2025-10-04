const { chmod, mkdir, writeFile } = require("fs/promises");
const { dirname, join } = require("path");

const projectRoot = process.cwd();
const binDir = join(projectRoot, "node_modules", ".bin");
const xdgOpenPath = join(binDir, "xdg-open");
const viteBinPath = join(binDir, "vite");
const viteCmdPath = join(binDir, "vite.cmd");
const wrapperPath = join(projectRoot, "scripts", "vite-wrapper.cjs");

async function ensureDir() {
  await mkdir(binDir, { recursive: true });
}

async function createXdgOpenStub() {
  const script = "#!/bin/sh\n# Stub generated to avoid browser auto-open in containers\nexit 0\n";
  await writeFile(xdgOpenPath, script, { mode: 0o755 });
}

async function patchViteBin() {
  const wrapperImportPath = wrapperPath.replace(/\\/g, "/");
  const shim = `#!/usr/bin/env node\nrequire("${wrapperImportPath}");\n`;
  await writeFile(viteBinPath, shim, { mode: 0o755 });

  const cmdShim = `@ECHO OFF\nnode \"${wrapperImportPath.replace(/\\/g, "\\\\")}\" %*\r\n`;
  await writeFile(viteCmdPath, cmdShim, { mode: 0o755 }).catch(() => undefined);
}

async function main() {
  try {
    await ensureDir();
    await Promise.all([
      createXdgOpenStub(),
      patchViteBin(),
      chmod(wrapperPath, 0o755)
    ]);
    console.log("[postinstall] Applied Vite wrapper and xdg-open stub");
  } catch (error) {
    console.error("[postinstall] Setup failed", error);
  }
}

main();
