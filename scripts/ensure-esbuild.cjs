// Works around a recurring npm/Windows bug where esbuild's platform-specific
// optional dependency (e.g. @esbuild/win32-x64) silently fails to install
// inside npm workspaces, breaking `tsx`/`vite` with:
//   Error: The package "@esbuild/win32-x64" could not be found
const { execSync } = require('node:child_process');
const path = require('node:path');

const PLATFORM_PACKAGES = {
  win32: { x64: '@esbuild/win32-x64', arm64: '@esbuild/win32-arm64', ia32: '@esbuild/win32-ia32' },
  darwin: { x64: '@esbuild/darwin-x64', arm64: '@esbuild/darwin-arm64' },
  linux: { x64: '@esbuild/linux-x64', arm64: '@esbuild/linux-arm64' },
};

const pkg = PLATFORM_PACKAGES[process.platform]?.[process.arch];
if (!pkg) process.exit(0);

try {
  require.resolve(`${pkg}/package.json`);
  process.exit(0);
} catch {
  // Not installed — fall through and fix it below.
}

let esbuildVersion;
try {
  esbuildVersion = require('esbuild/package.json').version;
} catch {
  process.exit(0);
}

console.log(`[postinstall] ${pkg} is missing, installing it explicitly...`);
try {
  execSync(`npm install ${pkg}@${esbuildVersion} --no-save --no-audit --no-fund`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
} catch {
  console.warn(
    `[postinstall] Could not auto-install ${pkg}. If dev/build fails with an esbuild error, run:\n` +
      `  npm install ${pkg}@${esbuildVersion} --no-save`,
  );
}
