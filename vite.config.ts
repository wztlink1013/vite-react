import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
// import customManifestPlugin from './customManifestPlugin';

const versionUpdatePlugin = (options: {
  version: string;
  date: any;
}): Plugin => {
  const { version, date } = options;
  let config: { publicDir: string, outDir: string };
  // @ts-ignore
  const writeVersion = (versionFile: string, content: string) => {
    fs.writeFile(versionFile, content, (err: any) => {
      if (err) throw err;
    });
  };
  return {
    name: 'vite-plugin-react-manifest-update',
    configResolved(resolvedConfig: any) {
      config = resolvedConfig;
    },
    transformIndexHtml: {
      order: 'pre',
      handler: async () => {
        return [
          {
            tag: 'meta',
            injectTo: 'head-prepend',
            attrs: {
              version,
            },
          },
          {
            tag: 'link',
            injectTo: 'head-prepend',
            attrs: {
              rel: 'manifest',
              href: '/manifest.json',
            },
          },
        ];
      },
    },
    // @ts-ignore
    generateBundle(outputOptions, bundle) {
      const files = [];

      for (const fileName in bundle) {
        const path = `http://localhost:4173/${fileName}`;
        files.push({ path });
      }

      const publicFile = `${config.publicDir}${path.sep}manifest.json`;
      const distFile = `${config.outDir || 'dist'}${path.sep}manifest.json`;
      const content = JSON.stringify({
        ...{
          name: 'vite-react-typescript-starter',
          origin: 'https://www.wztlink1013.com',
          scope: '/',
          short_name: 'vite-react-typescript-starter',
          start_url: '/login',
          theme_color: '#ffffff',
          display: 'standalone',
          background_color: '#ffffff',
          files,
        },
        date,
        version,
      });

      if (fs.existsSync(config.publicDir)) {
        writeVersion(publicFile, content);
        writeVersion(distFile, content);
      } else {
        fs.mkdir(config.publicDir, (err: any) => {
          if (err) throw err;
          writeVersion(publicFile, content);
          writeVersion(distFile, content);
        });
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(() => {
  const date = new Date();
  const __APP_VERSION__ = String(date.getTime());
  return {
    plugins: [
      react(),
      versionUpdatePlugin({
        version: __APP_VERSION__,
        date,
      }),
      // customManifestPlugin(),
    ],
    define: {
      __APP_VERSION__,
    },
    build: {
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: () => `js/[name].[hash].js`,
          chunkFileNames: () => `js/[name].[hash].js`,
          assetFileNames: (assetInfo) =>
            `${/\.(css)$/.test(assetInfo.name ?? '') ? 'css' : 'assets'}/[name].[hash].[ext]`,
        },
      },
    },
  };
});
