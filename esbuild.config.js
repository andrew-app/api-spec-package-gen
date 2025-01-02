import { build } from 'esbuild'

const options = {
  entryPoints: ['index.ts'],
  outfile: 'build/index.cjs',
  platform: 'node',
  target: 'node20',
  bundle: true,
  minifyWhitespace: true,
  external: ['node-gyp']
}
build(options).catch(() => process.exit(1))