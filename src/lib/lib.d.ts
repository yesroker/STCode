declare global {
  interface Window {
    JSONPath: any; // <-- 解决 JSONPath 错误
    STCode: any; // <-- 解决 STCode 错误
  }
}
export {};