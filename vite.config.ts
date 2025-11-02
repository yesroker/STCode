import { defineConfig } from 'vite';
import type { Plugin, ResolvedConfig } from 'vite';
import { Server } from 'socket.io';
//import { resolve } from 'path';//monaco-editor-auto-typings工作依赖此
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

let io: Server | undefined;

function sillyTavernHotReload(): Plugin {
  let isWatching = false;

  return {
    name: 'sillytavern-hot-reload',

    configResolved(resolvedConfig: ResolvedConfig) {
      isWatching = resolvedConfig.build.watch !== null;
    },

    buildStart() {
      if (!isWatching || io) return;

      const port = 6621;
      io = new Server(port, { cors: { origin: '*' } });

      console.info(`[Vite-Listener] 已启动酒馆监听服务, 正在监听: http://0.0.0.0:${port}`);

      io.on('connect', socket => {
        console.info(`[Vite-Listener] 成功连接到酒馆网页 '${socket.id}', 初始化推送...`);
        socket.on('disconnect', (reason: string) => {
          console.info(`[Vite-Listener] 与酒馆网页 '${socket.id}' 断开连接: ${reason}`);
        });
      });
    },

    closeBundle() {
      if (io) {
        console.info('\n[Vite-Listener] 检测到完成编译, 推送更新事件...');
        io.emit('iframe_updated');
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const isWatchMode = mode === 'watch';
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']]
        }
      }),
      viteSingleFile(),
      tailwindcss(),
      sillyTavernHotReload()
    ],
    //   resolve: {
    //     alias: {
    //       path: 'path-browserify',//monaco-editor-auto-typings工作依赖此
    //     },
    //   },,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      minify: isWatchMode ? false : true,
      sourcemap: isWatchMode ? true : false,
      rollupOptions: {
        external: ['toastr', 'jquery', 'lodash', 'yaml'],
        output: {
          format: 'iife',
          globals: {
            toastr: 'toastr',
            jquery: '$',
            lodash: '_',
            yaml: 'YAML'
          },
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].chunk.js`,
          assetFileNames: `assets/[name].[ext]`
        }
      }
    }
  };
});
