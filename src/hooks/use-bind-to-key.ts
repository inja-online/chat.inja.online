"use client";

import { useCallback, useContext, useEffect, useRef } from "react";

import { BoundKeysContext } from "~/providers/bind-to-key";

type KeyCombination = string[];
type KeyBindings = KeyCombination | KeyCombination[];

/**
 * Binds a key combination to a callback function.
 *
 * @param keys - The key combination to bind.
 * keys can be provided as either a single array of combinations or an array of arrays of combinations.
 * e.g. ['cmd', 'k'] or [['cmd', 'k'], ['cmd', 'shift', 'k']]
 * @param callback - The callback function to call when the key combination is pressed.
 */
export const useBindToKey = (
  keys: KeyBindings,
  callback: (keys: KeyBindings) => void
): void => {
  const { registerBinding, unregisterBinding } = useContext(BoundKeysContext);
  const bindingIds = useRef<string[]>([]);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cleanupBindings = useCallback(() => {
    for (const id of bindingIds.current) {
      unregisterBinding(id);
    }
    bindingIds.current = [];
  }, [unregisterBinding]);

  useEffect(() => {
    cleanupBindings();

    const keyCombinations = Array.isArray(keys[0])
      ? (keys as KeyCombination[])
      : ([keys] as KeyCombination[]);

    bindingIds.current = keyCombinations.map((combination) =>
      registerBinding({
        keys: combination,
        action: () => callbackRef.current(combination),
      })
    );

    return cleanupBindings;
  }, [keys, registerBinding, cleanupBindings]);
};
