const esbuildBase = require('@soothe/tsconfig/esbuild.base')
const options = {
  ...esbuildBase.config,
  entryPoints: [
    './src/index.ts',
    './src/constants.ts',
    './src/utils.ts',
  ],
  outfile: undefined,
  outdir: 'dist',
}
esbuildBase.run(options)
