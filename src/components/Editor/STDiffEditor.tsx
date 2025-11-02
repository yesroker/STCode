import { DiffEditor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { pathMap } from '@/lib/constants';
import { CollapseContainer } from '../Wrap/CollapseContainer';
import { AnimatedView } from '../Wrap/AnimatedView';

type STDiffEditorProps = {
  allmodified: string;
  alloriginal: string;
  datamodified: string;
  dataoriginal: string;
};

export default function STDiffEditor({
  allmodified,
  alloriginal,
  dataoriginal,
  datamodified,
}: STDiffEditorProps) {
  const appContext = useContext(AppContext);
  if (!appContext) return;

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
        original={`${appContext.currentView === 'All' ? alloriginal : dataoriginal}`}
        modified={`${appContext.currentView === 'All' ? allmodified : datamodified}`}
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
