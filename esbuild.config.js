import { build } from 'esbuild'

const options = {
  entryPoints: ['main.ts'],
  outfile: 'dist/main.cjs',
  platform: 'node',
  target: 'node20',
  bundle: true,
  external: ['node-gyp'],
  minifyWhitespace: true,
}
build(options).catch(() => process.exit(1))