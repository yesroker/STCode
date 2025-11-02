import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import STCodeEditor from './components/Editor/STCodeEditor';
// import editor from 'monaco-editor';//将monaco打包进本体
import type { editor } from 'monaco-editor';
import { type Mode, type View } from './lib/constants';
import STDiffEditor from './components/Editor/STDiffEditor';
import Controls from './components/Controls';
import Header from './components/Header';
import { AppContext } from './context/AppContext';
import { createRegionBlock, Editorlize, matchRegion, type File } from './lib/region';
import _ from 'lodash';
import { JSONPath } from 'jsonpath-plus';

function findClosestData(messageId: number) {
  let idToCheck = messageId;
  while (idToCheck >= 0) {
    const msgs = getChatMessages(idToCheck);
    if (msgs && msgs.length > 0) {
      const msg = msgs[0].message;
      const data = matchRegion(msg, 'data');
      if (data) {
        return data;
      }
    }
    idToCheck--;
  }
  return '';
}

function App() {
  const [currentMode, setCurrentMode] = useState<Mode>('Code');
  const [currentView, setCurrentView] = useState<View>('All');
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [hasLoad, sethasLoad] = useState<boolean>(false);
  const filesRef: RefObject<Record<File, string>> = useRef({
    All: '',
    Data: '',
    PreviousAll: '',
    PreviousData: ''
  });
  const dafultHeightRef = useRef(0);
  useEffect(() => {
    if (getCurrentMessageId() !== getLastMessageId()) {
      setIsOpen(false);
    }
    //STCode
    if (_.get(parent.window, 'STCode.hasInit')) return;
    parent.window.JSONPath = parent.window.JSONPath || JSONPath;
    SillyTavern.registerMacro('STCode.REGION.data', () => {
      return createRegionBlock('data', findClosestData(TavernHelper.getLastMessageId()));
    });

    _.set(parent.window, 'STCode.hasInit', true);
  }, []);

  useEffect(() => {
    if (isOpen && !hasLoad) {
      (async () => {
        filesRef.current = await Editorlize();
      })();
      dafultHeightRef.current = Math.max(filesRef.current.All.split('\n').length * 5, 1100);
      sethasLoad(true);
    }
  }, [isOpen, hasLoad]);

  const appContextValue = useMemo(
    () => ({
      isOpen,
      currentView,
      currentMode,
      codeEditorRef,
      diffEditorRef,
      dafultHeightRef,
      setIsOpen,
      setCurrentView,
      setCurrentMode
    }),
    [isOpen, currentView, currentMode]
  );

  return (
    <div className="flex-col flex relative w-screen">
      <AppContext.Provider value={appContextValue}>
        <Header />
        <STCodeEditor filesRef={filesRef} />
        <STDiffEditor
          allmodified={filesRef.current.All}
          alloriginal={filesRef.current.PreviousAll}
          datamodified={filesRef.current.Data}
          dataoriginal={filesRef.current.PreviousData}
        />
        {isOpen && <Controls loc="left-botton" />}
      </AppContext.Provider>
    </div>
  );
}

export default App;
