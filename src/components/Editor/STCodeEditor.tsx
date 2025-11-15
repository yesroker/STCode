// import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings';
import { useContext, type RefObject } from 'react';
// import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Editor, type Monaco } from '@monaco-editor/react';
import { AppContext } from '../../AppContext';
import { buildFileContent, foldRegion } from '../../lib/region';
import { pathMap } from '@/types&constants';
import { CollapseContainer } from '@/components/Wrap/CollapseContainer';
import { AnimatedView } from '../Wrap/AnimatedView';
import * as prettier from 'prettier/standalone';
import { PRETTIER_OPTIONS } from '@/types&constants';

export default function STCodeEditor() {
 const appContext = useContext(AppContext);
 if (!appContext) return;
 const regions = appContext.regionsRef.current;
 const handleEditorBefforeMount = async (monaco: Monaco) => await InitMocaco(monaco);

 async function handleEditorDidMount(editorInstance: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
  if (!appContext) return;
  appContext.codeEditorRef.current = editorInstance;
  if (appContext.currentView === 'All') {
   //默认就think、task不折叠
   await foldRegion('export', editorInstance);
   await foldRegion('data', editorInstance);
   await foldRegion('postProcess', editorInstance);
   await foldRegion('mainText', editorInstance);
   await foldRegion('worldBook', editorInstance);
   await foldRegion('vfs', editorInstance);
   await foldRegion('status', editorInstance);
   await foldRegion('privateData', editorInstance);
   await foldRegion('import', editorInstance);
  }
 }
 return (
  <CollapseContainer show={appContext.isOpen}>
   <AnimatedView show={appContext.currentMode === 'Code'}>
    <Editor
     height={`900px`}
     defaultLanguage="typescript"
     key={appContext.currentView}
     theme="vs-dark"
     options={{ wordWrap: 'on' }}
     path={pathMap[appContext.currentView]}
     defaultValue={appContext.currentView === 'All' ? buildFileContent('All', regions) : buildFileContent('Data', regions)}
     onMount={handleEditorDidMount}
     keepCurrentModel={true}
     beforeMount={handleEditorBefforeMount}
    />
   </AnimatedView>
  </CollapseContainer>
 );
}

async function InitMocaco(monaco: Monaco) {
 //参考https://juejin.cn/post/7501187644328509503
 function registLib() {
  const lodashTypeFiles = import.meta.glob('/node_modules/@types/lodash/**/*.d.ts', {
   query: '?raw',
   eager: true,
   import: 'default'
  });
  Object.keys(lodashTypeFiles).forEach(key => {
   const code = lodashTypeFiles[key] as string;
   monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
  });

  const jsonPathTypeFiles = import.meta.glob('/node_modules/@types/jsonpath-plus/**/*.d.ts', {
   query: '?raw',
   eager: true,
   import: 'default'
  });
  Object.keys(jsonPathTypeFiles).forEach(key => {
   const code = jsonPathTypeFiles[key] as string;
   monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
  });

  const toastrTypeFiles = import.meta.glob('/node_modules/@types/toastr/**/*.d.ts', {
   query: '?raw',
   eager: true,
   import: 'default'
  });
  Object.keys(toastrTypeFiles).forEach(key => {
   const code = toastrTypeFiles[key] as string;
   monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
  });

  const yamlTypeFiles = import.meta.glob('/node_modules/yaml/**/*.d.ts', {
   query: '?raw',
   eager: true,
   import: 'default'
  });
  Object.keys(yamlTypeFiles).forEach(key => {
   const code = yamlTypeFiles[key] as string;
   monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
  });

  const typeFestTypeFiles = import.meta.glob('/node_modules/type-fest/**/*.d.ts', {
   query: '?raw',
   eager: true,
   import: 'default'
  });
  Object.keys(typeFestTypeFiles).forEach(key => {
   const code = typeFestTypeFiles[key] as string;
   monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${key}`);
  });

  const sillytavernTypeFiles = import.meta.glob('/ST/index.d.ts', {
   query: '?raw',
   eager: true,
   import: 'default'
  });
  Object.keys(sillytavernTypeFiles).forEach(key => {
   const code = sillytavernTypeFiles[key] as string;
   monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file:///ST.d.ts`);
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
      text: formattedText
     }
    ];
   }
  });
 }
 registLib();
 regisFormattingProvider();
}
