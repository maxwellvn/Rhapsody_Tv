import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

export interface PiPVideoData {
  videoUri: string;
  title: string;
  channelName?: string;
  thumbnailSource?: ImageSourcePropType;
  isLive?: boolean;
  currentTime?: number;
  videoId?: string;
}

interface PiPContextType {
  isInPiP: boolean;
  pipData: PiPVideoData | null;
  enterPiP: (data: PiPVideoData) => void;
  exitPiP: () => void;
  updatePiPTime: (time: number) => void;
}

const PiPContext = createContext<PiPContextType | undefined>(undefined);

interface PiPProviderProps {
  children: ReactNode;
}

export function PiPProvider({ children }: PiPProviderProps) {
  const [isInPiP, setIsInPiP] = useState(false);
  const [pipData, setPipData] = useState<PiPVideoData | null>(null);

  const enterPiP = useCallback((data: PiPVideoData) => {
    setPipData(data);
    setIsInPiP(true);
  }, []);

  const exitPiP = useCallback(() => {
    setIsInPiP(false);
    setPipData(null);
  }, []);

  const updatePiPTime = useCallback((time: number) => {
    setPipData(prev => prev ? { ...prev, currentTime: time } : null);
  }, []);

  return (
    <PiPContext.Provider value={{ isInPiP, pipData, enterPiP, exitPiP, updatePiPTime }}>
      {children}
    </PiPContext.Provider>
  );
}

export function usePiP() {
  const context = useContext(PiPContext);
  if (context === undefined) {
    throw new Error('usePiP must be used within a PiPProvider');
  }
  return context;
}
