/* eslint-disable @typescript-eslint/no-unused-vars */
// import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings';
import { useContext, type RefObject } from 'react';
// import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Editor, type Monaco } from '@monaco-editor/react';
import { AppContext } from '../../context/AppContext';
import { foldRegion, type File } from '../../lib/region';
import { InitMocaco } from '../../lib/utils';
import { pathMap } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CollapseContainer } from '@/components/Wrap/CollapseContainer';
import { AnimatedView } from '../Wrap/AnimatedView';

type Props = {
  filesRef: RefObject<Record<File, string>>;
};
export default function STCodeEditor({ filesRef }: Props) {
  const appContext = useContext(AppContext);
  if (!appContext) return;
  const handleEditorBefforeMount = async (monaco: Monaco) => await InitMocaco(monaco);

  async function handleEditorDidMount(editorInstance: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    if (!appContext) return;
    appContext.codeEditorRef.current = editorInstance;

    //默认就think、task、maintext区不折叠
    await foldRegion('import', editorInstance);
    await foldRegion('export', editorInstance);
    await foldRegion('data', editorInstance);
    await foldRegion('postProcess', editorInstance);
    await foldRegion('worldBook', editorInstance);
    await foldRegion('status', editorInstance);
    await foldRegion('privateData', editorInstance);
  }

  return (
    <CollapseContainer show={appContext.isOpen}>
      <AnimatedView show={appContext.currentMode === 'Code'}>
        <Editor
          height={`${appContext.dafultHeightRef.current}px`}
          defaultLanguage="typescript"
          key={appContext.currentView}
          theme="vs-dark"
          options={{ wordWrap: 'on' }}
          path={pathMap[appContext.currentView]}
          defaultValue={appContext.currentView === 'All' ? filesRef.current.All : filesRef.current.Data}
          onMount={handleEditorDidMount}
          keepCurrentModel={true}
          beforeMount={handleEditorBefforeMount}
        />
      </AnimatedView>
    </CollapseContainer>
  );
}
