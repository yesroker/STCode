import { uneval } from 'devalue';
import type { View } from './constants';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as _ from 'lodash';

export type File = 'Data' | 'All' | 'PreviousData' | 'PreviousAll';
export type CodeResults = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  privateData: { [key: string]: any };
  mainText?: string;
  status?: string;
  entryMap?: Map<string, string>;
};

//#region 1. 动态加载模板文件
const templateModules = import.meta.glob('/config/region/*.js', {
  query: '?raw',
  eager: true,
  import: 'default',
});

const rawTemplates = Object.fromEntries(
  Object.entries(templateModules).map(([path, content]) => {
    const name = path.split('/').pop()?.replace('.js', '') || '';
    const normalizedContent = (content as string).replace(/\r\n/g, '\n');
    return [name, normalizedContent];
  }),
) as Record<string, string>;
//#endregion

//#region 2. 单一事实来源

type msglizeFn = (results: CodeResults, editorValue: string) => string | null;

type RegionConfig = {
  name: string;
  template: string;
  inherit: boolean; // Editorlize 中是否继承? (false 则为 currentOnly)
  partOfAll: boolean; // 是否是 'All' 文件的一部分?
  partOfData: boolean; // 是否是 'Data' 文件的一部分?
  msglize: msglizeFn | null; // STlize 的序列化方法, null 表示不处理
};
//这里的类型定义和上面没关联起来，以后改
const REGION_DEFINITIONS = [
  // name, inherit, partOfAll, partOfData, stlize
  {
    name: 'import',
    inherit: false,
    partOfAll: true,
    partOfData: false,
    msglize: null,
  },
  {
    name: 'worldBook',
    inherit: false,
    partOfAll: true,
    partOfData: false,
    msglize: null,
  },
  {
    name: 'data',
    inherit: true,
    partOfAll: true,
    partOfData: true,
    msglize: (res: CodeResults) => `const data = ${uneval(res.data)}`,
  },
  {
    name: 'privateData',
    inherit: true,
    partOfAll: true,
    partOfData: true,
    msglize: (res: CodeResults) => `const privateData = ${uneval(res.privateData)}`,
  },
  {
    name: 'think',
    inherit: false,
    partOfAll: true,
    partOfData: false,
    msglize: (res: CodeResults, val: string): string => matchRegion(val, 'think')?.trim() || '',
  },
  {
    name: 'mainText',
    inherit: false,
    partOfAll: true,
    partOfData: false,
    msglize: (res: CodeResults) => `let mainText = \`${res.mainText?.trim() || ''}\``,
  },
  {
    name: 'task',
    inherit: false,
    partOfAll: true,
    partOfData: false,
    msglize: (res: CodeResults, val: string): string => matchRegion(val, 'task')?.trim() || '',
  },
  {
    name: 'postProcess',
    inherit: true,
    partOfAll: true,
    partOfData: false,
    msglize: (res: CodeResults, val: string): string =>
      matchRegion(val, 'postProcess')?.trim() || '',
  },
  {
    name: 'status',
    inherit: true,
    partOfAll: true,
    partOfData: false,
    msglize: (res: CodeResults) => `let status = \`${res.status?.trim() || ''}\``,
  },
  {
    name: 'export',
    inherit: false,
    partOfAll: false, // export 自身不加入 All, 而是动态生成
    partOfData: false, // export 自身不加入 Data, 而是动态生成
    msglize: null,
  },
] as const;

// --- 动态派生类型 ---
// 1. 获取所有基础名称 (e.g., 'import' | 'data' | ... | 'export')
type BaseRegionName = (typeof REGION_DEFINITIONS)[number]['name'];

// 2. 动态生成配置 Map
export const REGION_CONFIG_MAP = new Map<BaseRegionName, RegionConfig>(
  REGION_DEFINITIONS.map(def => [
    def.name,
    {
      ...def,
      template: rawTemplates[def.name] || '',
    },
  ]),
);
//#endregion

//#region 3. 动态生成常量和类型 (极大简化)

// --- 动态派生类型 ---
// 1. PreviousRegionName 现在是所有基础名称的 'previous_' 版本
export type PreviousRegionName = `previous_${BaseRegionName}`;

// 2. 最终的 RegionName 类型是基础名称和 previous 名称的联合
export type RegionName = BaseRegionName | PreviousRegionName;

// 1. 最终的模板对象 (REGION)
const finalRegionObject = REGION_DEFINITIONS.reduce(
  (acc, def) => {
    // 1. 添加基础 region (e.g., 'data')
    acc[def.name] = rawTemplates[def.name] || '';
    const prevName = `previous_${def.name}` as PreviousRegionName;
    acc[prevName] = undefined;
    return acc;
  },
  {} as Record<RegionName, string | undefined>,
);

export const REGION = finalRegionObject;

// 2. 最终的名称数组 (regionNames)
export const regionNames = REGION_DEFINITIONS.reduce(
  (acc, def) => {
    acc.push(def.name); // 'data'
    acc.push(`previous_${def.name}`);
    return acc;
  },
  [] as RegionName[], 
);

// 3. 动态生成 previous names
export const previousRegionNames = regionNames.filter(name =>
  name.startsWith('previous_'),
) as PreviousRegionName[];

//#endregion

//#region regex
const regionReg = (() => {
  const createRegionRegex = (regionName: string) =>
    new RegExp(`//#region ${regionName}\\n?([\\s\\S]*?)\\n?//#endregion`, 'm');

  const allBaseNames = Array.from(REGION_CONFIG_MAP.keys()); // BaseRegionName[]

  const regexMap = allBaseNames.reduce(
    (accumulator, name) => {
      accumulator[name] = createRegionRegex(name);
      return accumulator;
    },
    {} as Record<BaseRegionName, RegExp>,
  );

  return regionNames.reduce(
    (acc, name) => {
      const baseName = name.replace('previous_', '') as BaseRegionName;
      acc[name] = regexMap[baseName];
      return acc;
    },
    {} as Record<RegionName, RegExp>,
  );
})();

export const createRegionBlock = (regionName: RegionName, content?: string): string => {
  const realTag = (
    regionName.startsWith('previous_') ? regionName.replace('previous_', '') : regionName
  ) as BaseRegionName;
  //情况有点特殊
  const entryMapPrefix = realTag === 'worldBook' ? `\nconst entryMap = new Map();` : '';

  if (content === undefined) return `//#region ${realTag}${entryMapPrefix}\n${REGION[regionName]}\n//#endregion`;
  if (content === '') return `//#region ${realTag}${entryMapPrefix}\n//#endregion`;
  return `//#region ${realTag}${entryMapPrefix}\n${content}\n//#endregion`;
};

export const matchRegion = (searchStr: string, regionName: RegionName) => {
  return searchStr.match(regionReg[regionName])?.[1]?.trim();
};
//#endregion

//#region core
/**
 * 从酒馆中获得编辑器所需的JS代码
 */
export async function Editorlize() {
  type QueryItem = {
    value: string | undefined;
    idIn: number;
  };
  const query: Record<RegionName, QueryItem> = regionNames.reduce(
    (obj, name) => {
      obj[name] = {
        value: undefined,
        idIn: -1,
      };
      return obj;
    },
    {} as Record<RegionName, QueryItem>,
  );
  let isCurrentMessage = true;
  let currentId = getCurrentMessageId();

  while (currentId >= 0) {
    const msgs = getChatMessages(currentId);
    if (!msgs || msgs.length === 0) break;
    const msg = msgs[0].message.replace(/\r\n/g, '\n');
    for (const [name, config] of REGION_CONFIG_MAP.entries()) {
      const rName = name;
      // 1. 处理 'inherit: false' (只在特定消息查找)
      if (!config.inherit) {
        if (isCurrentMessage) {
          //worldBook未来优化,现在单独处理
          if (rName === 'worldBook') {
            const charName = SillyTavern.characters[SillyTavern.characterId].name;
            const charSTWorldName = `STCode_${charName}`;
            //不存在先创建
            if (!TavernHelper.getWorldbookNames().includes(charSTWorldName)) {
              await TavernHelper.createWorldbook(charSTWorldName);
              const { primary, additional } = TavernHelper.getCharWorldbookNames('current');
              const additionalSet = new Set(additional);
              additionalSet.add(charSTWorldName);
              TavernHelper.rebindCharWorldbooks('current', {
                primary,
                additional: [...additionalSet],
              });
            }
            //获得条目形成str
            const entries = await getWorldbook(charSTWorldName);
            let str = '';
            entries.forEach(entry => {
              str += `entryMap.set('${entry.name}',\`
${entry.content}
\`)\n`;
            });
            query[rName].value = str;
          } else {
            query[rName].value = matchRegion(msg, rName);
          }
        } else {
          // *总是* 查找 'previous_' 版本
          const prevName = `previous_${rName}` as PreviousRegionName;
          query[prevName].value = matchRegion(msg, rName); // 匹配 'task' 赋给 'previous_task'
        }
        // ⬇️ 注意: for...of 循环中要用 'continue' 替代 'return'
        continue; // 处理完毕
      }
      // 2. 处理 'inherit: true' (继承前文)
      if (config.inherit) {
        if (!query[rName].value) {
          if (rName === 'status') {
            //status特殊，这里找的是模板，而不是序列化后的值
            query.status.value = _.get(msgs[0].data, 'STCode.status');
          } else {
            query[rName].value = matchRegion(msg, rName);
          }
          query[rName].idIn = currentId;
        }
      }
    }
    // 3. 处理 'previous' 查找
    previousRegionNames.forEach(name => {
      const baseName = name.replace('previous_', '') as BaseRegionName;
      const baseQueryItem = query[baseName];

      if (!query[name].value && baseQueryItem && currentId < baseQueryItem.idIn) {
        //status和worldBook暂时单独处理
        if (name === 'previous_status') {
          query.previous_status.value = _.get(msgs[0].data, 'STCode.status');
        } else if (name === 'previous_worldBook') {
          query.previous_worldBook.value = query.worldBook.value;
        } else {
          query[name].value = matchRegion(msg, baseName);
        }
      }
    });
    if (query.data.value && query.previous_data.value) break;

    isCurrentMessage = false;
    currentId--;
  }
  const result = regionNames.reduce(
    (obj, name) => {
      obj[name] = createRegionBlock(name, query[name].value);
      return obj;
    },
    {} as Record<RegionName, string>,
  );
  const output: Record<File, string> = {
    Data: '',
    All: '',
    PreviousAll: '',
    PreviousData: '',
  };

  const buildOutput = (part: 'partOfAll' | 'partOfData', isPrevious: boolean): string => {
    const parts: string[] = [];
    REGION_CONFIG_MAP.forEach((config, name) => {
      // name 是 BaseRegionName
      if (config[part]) {
        let key: RegionName;
        if (isPrevious) {
          key = `previous_${name}` as PreviousRegionName;
        } else {
          key = name;
        }
        parts.push(result[key]);
      }
    });
    return parts.join('\n');
  };

  const dataExport = createRegionBlock('export', 'export {data,privateData}');
  const allExport = createRegionBlock(
    'export',
    'export {entryMap,data,privateData,mainText,status}',
  );

  output.Data = [buildOutput('partOfData', false), dataExport].join('\n');
  output.All = [buildOutput('partOfAll', false), allExport].join('\n');
  output.PreviousData = [buildOutput('partOfData', true), dataExport].join('\n');
  output.PreviousAll = [buildOutput('partOfAll', true), allExport].join('\n');
  return output;
}

/**
 * 代码执行后应该生成的新楼层消息
 */
export function msglize(currentEditorValue: string, codeResults: CodeResults, currentView: View) {
  const isAllMode = currentView === 'All';
  const msgs = getChatMessages(getCurrentMessageId());
  if (!msgs || msgs.length == 0) return;
  let msg = msgs[0].message;
  msg = msg.replace(/\r\n/g, '\n');

  function replaceMsgRegion(regionName: BaseRegionName, replaceStr: string) {
    if (regionReg[regionName].test(msg)) {
      msg = msg.replace(regionReg[regionName], createRegionBlock(regionName, replaceStr));
    } else {
      msg += '\n' + createRegionBlock(regionName, replaceStr);
    }
  }
  REGION_CONFIG_MAP.forEach((config, name) => {
    // name 是 BaseRegionName
    if (!config.msglize) return;
    const isDataRegion = config.name === 'data' || config.name === 'privateData';
    if (!isAllMode && !isDataRegion) {
      return;
    }
    const replaceStr = config.msglize(codeResults, currentEditorValue);
    if (replaceStr !== null) {
      replaceMsgRegion(name, replaceStr);
    }
  });
  return msg;
}
//#endregion
//#region 辅助
export function handleImportAndExportRegion(str: string): string {
  return str.replace(regionReg.import, '').replace(regionReg.export, (match, p1) => {
    return `//#region export\n${p1.replace('export', 'return')}\n//#endregion`;
  });
}
export function foldRegion(
  regionName: RegionName,
  editorInstance: monaco.editor.IStandaloneCodeEditor,
) {
  const model = editorInstance.getModel();
  if (!model) return;

  const matches = model.findMatches(
    `//#region ${regionName.replace('previous_', '')}`,
    false,
    false,
    true,
    null,
    true,
  );

  if (matches.length > 0) {
    const lineNumber = matches[0].range.startLineNumber;
    editorInstance.revealLine(lineNumber);
    editorInstance.setPosition({ lineNumber: lineNumber, column: 1 });
    return editorInstance.getAction('editor.fold')?.run();
  }
}
//#endregion
