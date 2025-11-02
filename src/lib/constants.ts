import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
export type Mode = 'Code' | 'Diff';
export const VIEW_TABS = ['All', 'Data'] as const;
export const pathMap = VIEW_TABS.reduce((pre, current) => {
  pre[current] = `file:///STCode/${current}.ts`;
  return pre;
}, {} as Record<View, string>);
export type View = (typeof VIEW_TABS)[number];
export const PRETTIER_OPTIONS = {
  parser: 'babel',
  plugins: [parserBabel, parserEstree],
  tabWidth: 2,
  semi: true,
  singleQuote: true,
};