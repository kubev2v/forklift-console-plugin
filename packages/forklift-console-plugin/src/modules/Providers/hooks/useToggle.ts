import { useState } from 'react';

/**
 * `useToggle` is a hook that manages a single boolean state value.
 * It initializes the state to the `initialValue` provided and returns
 * the current state and a function to toggle it.
 *
 * @param {boolean} initialValue - The initial state.
 * @returns {Array} An array where the first element is the current state
 * and the second element is a function to toggle the state.
 *
 * @example
 * const [isOpen, toggleIsOpen] = useToggle(false);
 * // To toggle the isOpen state
 * toggleIsOpen();
 */
export const useToggle = (initialValue = false): [boolean, () => void] => {
  const [value, setIsOpen] = useState(initialValue);

  const toggle = () => {
    setIsOpen((v) => !v);
  };

  return [value, toggle];
};

export default useToggle;
