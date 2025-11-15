import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
export const VIEW_TABS = ['All', 'Data'] as const;
export const pathMap = VIEW_TABS.reduce(
 (pre, current) => {
  pre[current] = `file:///STCode/${current}.ts`;
  return pre;
 },
 {} as Record<View, string>
);
export const PRETTIER_OPTIONS = {
 parser: 'babel',
 plugins: [parserBabel, parserEstree],
 tabWidth: 2,
 semi: true,
 singleQuote: true
};
//
export type File = 'Data' | 'All' | 'PreviousData' | 'PreviousAll';
export type Mode = 'Code' | 'Diff';
export type CodeResults = {
 data: { [key: string]: unknown };
 privateData: { [key: string]: unknown };
 mainText?: string;
 status?: string;
 entryMap?: Map<string, string>;
};
export type View = (typeof VIEW_TABS)[number];