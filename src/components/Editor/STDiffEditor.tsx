import { DiffEditor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { pathMap } from '@/types&constants';
import { CollapseContainer } from '../Wrap/CollapseContainer';
import { AnimatedView } from '../Wrap/AnimatedView';
import { buildFileContent } from '@/lib/region';

export default function STDiffEditor() {
  const appContext = useContext(AppContext);
  if (!appContext) return;
  const regions = appContext.regionsRef.current;

  function handleEditorDidMount(editorInstance: editor.IStandaloneDiffEditor) {
    if (!appContext) return;
    appContext.diffEditorRef.current = editorInstance;
  }

  return (
    <CollapseContainer show={appContext.isOpen}>
      <AnimatedView show={appContext.currentMode === 'Diff'}>
        <DiffEditor
          height={`${appContext.dafultHeightRef.current}px`}
          theme="vs-dark"
          key={appContext.currentView}
          options={{ wordWrap: 'on' }}
          original={`${appContext.currentView === 'All' ? buildFileContent('PreviousAll', regions) : buildFileContent('PreviousData', regions)}`}
          modified={`${appContext.currentView === 'All' ? buildFileContent('All', regions) : buildFileContent('Data', regions)}`}
          modifiedModelPath={pathMap[appContext.currentView]}
          originalModelPath={pathMap[appContext.currentView].replace('STCode/', 'STCode/previous/')}
          keepCurrentModifiedModel={true}
          keepCurrentOriginalModel={true}
          language="typescript"
          onMount={handleEditorDidMount}
        />
      </AnimatedView>
    </CollapseContainer>
  );
}
