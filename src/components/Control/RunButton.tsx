import { cn } from '@/lib/utils';
import toastr from 'toastr';
import { AppContext } from '@/context/AppContext';
import { useContext } from 'react';
import { handleImportAndExportRegion, matchRegion, msglize, type CodeResults } from '@/lib/region';
import { JSONPath } from 'jsonpath-plus';
// import * as Babel from '@babel/standalone';
// import { createRoot, type Root } from 'react-dom/client';

const RunButton = () => {
  const appContext = useContext(AppContext);
  //   const previewRootRef: React.RefObject<Root | null> = useRef(null);

  async function run() {
    if (!appContext) return;
    const { diffEditorRef, codeEditorRef, currentView, currentMode } = appContext;
    let currentEditorValue = '';

    if (currentMode === 'Diff') {
      currentEditorValue = diffEditorRef.current?.getModifiedEditor().getValue() ?? '';
    } else {
      currentEditorValue = codeEditorRef.current?.getValue() ?? '';
    }
    try {
      const transformedCode = handleImportAndExportRegion(currentEditorValue);
    //   const lib =  JSONPath ;

    //   const codeResults: CodeResults = new Function(...Object.keys(lib), transformedCode)(lib);
      const codeResults: CodeResults = new Function('JSONPath', transformedCode)(JSONPath);
    //   const codeResults: CodeResults = new Function(transformedCode)();

      //处理普通的块
      const newMessage = msglize(currentEditorValue, codeResults, currentView);
      let payload: { message_id: number } & Partial<ChatMessage> = {
        message_id: getCurrentMessageId(),
        message: newMessage,
      };

      //处理世界书，在本架构下，世界书是个常量，不应该变化
      if (codeResults.entryMap) {
        const entryMap = codeResults.entryMap;
        const charName = SillyTavern.characters[SillyTavern.characterId].name;
        const charSTWorldName = `STCode_${charName}`;
        const stWorldbook = await getWorldbook(charSTWorldName);
        //原子化的更改，但是name的值相同则替换
        entryMap?.forEach((value, name) => {
          stWorldbook.forEach(entry => {
            if (entry.name === name) {
              entry.content = value.trim();
            }
          });
        });
        await replaceWorldbook(charSTWorldName, stWorldbook);
      }

      //处理状态栏，状态栏的模板是可以随游戏而变化的
      if (codeResults.status) {
        const statusTemplate = matchRegion(currentEditorValue, 'status');
        payload = {
          ...payload,
          data: {
            ...getChatMessages(getCurrentMessageId())[0].data,
            STCode: { status: statusTemplate },
          },
        };
      }
      setChatMessages([payload], { refresh: 'affected' });
    } catch (error) {
      toastr.error(String(error));
    }
  }
  return (
    <button
      type="button"
      onClick={run}
      className={cn(
        'hover:opacity-80 active:scale-95 transition-all duration-100 ease-in-out w-8 h-8 text-white hover:text-stone-400',
      )}
    >
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4815">
        <path
          d="M264.3 141.6l275.4 179.3 284 184.8c1 0.6 3.6 2.4 3.6 6.7 0 4.3-2.6 6.1-3.6 6.7L539.8 704 264.3 883.3c-0.2-1-0.3-2.1-0.3-3.5V145.1c0-1.3 0.2-2.5 0.3-3.5M262 66.2c-36.5 0-70 32.9-70 78.9v734.6c0 46 33.5 78.9 70 78.9 11.6 0 23.6-3.3 34.8-10.7L579 764.2l284-184.8c48.5-31.6 48.5-102.5 0-134.1L579 260.5 296.9 76.9c-11.3-7.3-23.2-10.7-34.9-10.7z"
          fill="currentColor"
          p-id="4816"
        ></path>
      </svg>
    </button>
  );
};
export default RunButton;
