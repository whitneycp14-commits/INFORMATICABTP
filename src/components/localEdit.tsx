import React from 'react';
import AdminEditOverlay, { QuickEditText } from './AdminEditOverlay';

export function useLocalEditableString(key: string, initial: string) {
  const [value, setValue] = React.useState<string>(() => {
    return localStorage.getItem(key) || initial;
  });

  const save = (val: string) => {
    localStorage.setItem(key, val);
    setValue(val);
  };

  return [value, save] as const;
}

export default AdminEditOverlay;
