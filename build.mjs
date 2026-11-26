import * as esbuild from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
const ctx = await esbuild.context({
  entryPoints: { app: 'src/App.tsx' }, bundle: true, splitting: true, format: 'esm',
  outdir: 'dist', minify: true, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }
});
if (process.argv.includes('--serve')) {
  await ctx.watch();
  await ctx.serve({ servedir: 'dist', host: '127.0.0.1', port: 5173 });
  console.log('Manchita en http://localhost:5173');
} else { await ctx.rebuild(); await ctx.dispose(); }
