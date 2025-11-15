import React, { createContext } from 'react';
import type { View, Mode } from '@/types&constants';
import type { editor } from 'monaco-editor';
import type { RegionName } from '@/lib/region';

type AppContextType = {
  currentView: View;
  currentMode: Mode;
  isOpen: boolean;
  dafultHeightRef: React.RefObject<number | null>;
  codeEditorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  diffEditorRef: React.RefObject<editor.IStandaloneDiffEditor | null>;
  regionsRef: React.RefObject<Record<RegionName, string>>;
  setCurrentView: React.Dispatch<React.SetStateAction<View>>;
  setCurrentMode: React.Dispatch<React.SetStateAction<Mode>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppContext = createContext<AppContextType | null>(null);
