import _ from 'lodash';
import * as YAML from 'yaml';

// --- Simplified VFS Node Type Definitions (No 'type' property) ---

/**
 * 表示一个文件节点
 */
export interface VfsFile {
  isOpen: boolean;
  content: string;
}

/**
 * 表示一个目录节点
 */
export interface VfsDirectory {
  isOpen: boolean;
  children: { [key: string]: VfsNode };
}

/**
 * VFS 节点是一个文件或目录
 * We differentiate by checking for the existence of the 'content' property.
 */
export type VfsNode = VfsFile | VfsDirectory;

/**
 * VFS 的顶层结构
 */
export interface VfsRoot {
  chat: VfsDirectory;
  global: VfsDirectory;
}

/**
 * 过滤 VFS 树并将其转换为对 AI 友好的 YAML 字符串。
 * @param vfsRoot 包含 character 和 global VFS 树的顶层对象
 * @returns 过滤和转换后的 YAML 字符串
 */
export function convertVfsToYamlForAI(vfsRoot: VfsRoot): string {
  // 内部递归函数，用于过滤节点
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function filterNode(node: VfsNode): any {
    // 检查是否为文件节点 (有 content 属性)
    if ('content' in node) {
      const fileNode = node as VfsFile;
      // 如果文件未打开，则替换内容
      if (!fileNode.isOpen) {
        return { ...fileNode, content: '[Content not open]' };
      }
      return fileNode;
    }
    // 否则为目录节点
    if ('children' in node) {
      const dirNode = node as VfsDirectory;
      // 如果目录未打开，则替换 children
      if (!dirNode.isOpen) {
        return { ...dirNode, children: '[children not open]' };
      }
      // 否则，递归过滤子节点
      const filteredChildren = _.mapValues(dirNode.children, filterNode);
      return { ...dirNode, children: filteredChildren };
    }
    return node;
  }

  const filteredRoot = {
    chat: filterNode(vfsRoot.chat),
    global: filterNode(vfsRoot.global),
  };

  return YAML.stringify(filteredRoot);
}