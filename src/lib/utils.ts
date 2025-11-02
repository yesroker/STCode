import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Monaco } from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import { PRETTIER_OPTIONS } from '@/lib/constants';

/**
 * * @param inputs (clsx, twMerge)
 * @returns 合并后的 class name
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
////////
//参考https://juejin.cn/post/7501187644328509503

export async function InitMocaco(monaco: Monaco) {
  function registLib() {
    const lodashTypeFiles = import.meta.glob('/node_modules/@types/lodash/**/*.d.ts', {
      query: '?raw',
      eager: true,
      import: 'default',
    });
    Object.keys(lodashTypeFiles).forEach(key => {
      const code = lodashTypeFiles[key] as string;
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
    });
    const jsonPathTypeFiles = import.meta.glob('/node_modules/@types/jsonpath-plus/**/*.d.ts', {
      query: '?raw',
      eager: true,
      import: 'default',
    });
    Object.keys(jsonPathTypeFiles).forEach(key => {
      const code = jsonPathTypeFiles[key] as string;
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
    });

    const toastrTypeFiles = import.meta.glob('/node_modules/@types/toastr/**/*.d.ts', {
      query: '?raw',
      eager: true,
      import: 'default',
    });
    Object.keys(toastrTypeFiles).forEach(key => {
      const code = toastrTypeFiles[key] as string;
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
    });
    const sillytavernTypeFiles = import.meta.glob('/node_modules/@types/ST/**/*.d.ts', {
      query: '?raw',
      eager: true,
      import: 'default',
    });
    Object.keys(sillytavernTypeFiles).forEach(key => {
      const code = sillytavernTypeFiles[key] as string;
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
    });
  }

  function regisFormattingProvider() {
    monaco.languages.registerDocumentFormattingEditProvider('typescript', {
      async provideDocumentFormattingEdits(model) {
        const text = model.getValue();
        let formattedText = '';
        try {
          formattedText = await prettier.format(text, PRETTIER_OPTIONS);
        } catch (e) {
          console.error('Prettier 格式化失败：', e);
          return [];
        }
        return [
          {
            range: model.getFullModelRange(),
            text: formattedText,
          },
        ];
      },
    });
  }
  registLib();
  regisFormattingProvider();

}
