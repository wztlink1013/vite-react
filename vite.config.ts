import {
  defineConfig,
  // IndexHtmlTransform,
  Plugin,
} from 'vite';
import react from '@vitejs/plugin-react';
// import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import fs from 'fs';
// import { resolve } from 'path';
import customManifestPlugin from './customManifestPlugin';

const versionUpdatePlugin = (options: {
  version: string;
  date: any;
}): Plugin => {
  const { version, date } = options;
  let config: { publicDir: string };
  const writeVersion = (versionFile: string, content: string) => {
    fs.writeFile(versionFile, content, (err: any) => {
      if (err) throw err;
    });
  };
  return {
    name: 'vite-plugin-react-manifest-update',
    configResolved(resolvedConfig: any) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },
    buildStart() {
      const file = `${config.publicDir}${path.sep}manifest.json`;
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
          icons: [
            {
              src: 'https://cdn.wostatic.cn/dist/icons/app_icon_pwa_32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: 'https://cdn.wostatic.cn/dist/icons/app_icon_pwa_64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'https://cdn.wostatic.cn/dist/icons/app_icon_pwa_128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: 'https://cdn.wostatic.cn/dist/icons/app_icon_pwa_256.png',
              sizes: '256x256',
              type: 'image/png',
            },
            {
              src: 'https://cdn.wostatic.cn/dist/icons/app_icon_pwa_512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'https://cdn.wostatic.cn/dist/icons/app_icon_pwa_1024.png',
              sizes: '1024x1024',
              type: 'image/png',
            },
          ],
          files: [
            {
              path: 'https://cdn.wostatic.cn/dist/lib/bootstrap/4.4.1/css/bootstrap.min.css',
            },
            {
              path: 'https://www.wztlink1013.com/public/img/avatar.png',
            }
          ],
        },
        date,
        version,
      });

      if (fs.existsSync(config.publicDir)) {
        writeVersion(file, content);
      } else {
        fs.mkdir(config.publicDir, (err: any) => {
          if (err) throw err;
          writeVersion(file, content);
        });
      }
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
      customManifestPlugin(),
    ],
    define: {
      __APP_VERSION__,
    },
    build: {
      sourcemap: true,
      // manifest: true,
      emptyOutDir: true,
    },
    // worker: {
    //   format: 'iife',
    // },
  };
});
