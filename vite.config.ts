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

interface PluginOptions {
  app_version: string;
}

const versionUpdatePlugin = (options: PluginOptions): Plugin => {
  const { app_version } = options;
  let config: { publicDir: string };
  const writeVersion = (versionFile: string, content: string) => {
    fs.writeFile(versionFile, content, (err: any) => {
      if (err) throw err;
    });
  };
  return {
    name: 'vite-plugin-react-version-update',
    configResolved(resolvedConfig: any) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },
    buildStart() {
      const file = `${config.publicDir}${path.sep}version.json`;
      const content = JSON.stringify({ app_version });

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
              app_version,
            },
          },
        ];
      },
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(() => {
  const __APP_VERSION__ = String(new Date().getTime());
  return {
    plugins: [
      react(),
      versionUpdatePlugin({
        app_version: __APP_VERSION__,
      }),
    ],
    define: {
      __APP_VERSION__,
    },
  };
});
