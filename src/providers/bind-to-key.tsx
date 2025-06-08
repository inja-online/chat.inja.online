'use client';

import {
  createContext,
  type FC,
  type ReactNode,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

export interface KeyBinding {
  id: string;
  keys: string[];
  action: () => void;
}

interface BoundKeysContextType {
  registerBinding: (binding: Omit<KeyBinding, 'id'>) => string;
  unregisterBinding: (id: string) => void;
}

const BoundKeysContext = createContext<BoundKeysContextType>({
  registerBinding: () => '',
  unregisterBinding: () => {},
});

interface BoundKeysProviderProps {
  children: ReactNode;
}

const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift']);

export const BoundKeysProvider: FC<BoundKeysProviderProps> = ({ children }) => {
  const bindingsRef = useRef<Map<string, KeyBinding>>(new Map());

  const registerBinding = useCallback(
    ({ keys, action }: Omit<KeyBinding, 'id'>): string => {
      const id = Math.random().toString(36).slice(2);
      bindingsRef.current.set(id, { id, keys, action });
      return id;
    },
    [],
  );

  const unregisterBinding = useCallback((id: string): void => {
    bindingsRef.current.delete(id);
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent): void => {
    const pressedKeys: string[] = [];

    if (event.metaKey) pressedKeys.push('cmd');
    if (event.ctrlKey) pressedKeys.push('ctrl');
    if (event.altKey) pressedKeys.push('alt');
    if (event.shiftKey) pressedKeys.push('shift');

    if (!MODIFIER_KEYS.has(event.key)) {
      pressedKeys.push(event.key.toLowerCase());
    }

    const pressedKeyString = pressedKeys.join('+');

    for (const binding of bindingsRef.current.values()) {
      const bindingKeyString = binding.keys.join('+');
      if (pressedKeyString === bindingKeyString) {
        event.preventDefault();
        binding.action();
        break;
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener('keydown', handleKeyPress, {
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [handleKeyPress]);

  const contextValue = useMemo(
    () => ({
      registerBinding,
      unregisterBinding,
    }),
    [registerBinding, unregisterBinding],
  );

  return (
    <BoundKeysContext.Provider value={contextValue}>
      {children}
    </BoundKeysContext.Provider>
  );
};

export { BoundKeysContext };
