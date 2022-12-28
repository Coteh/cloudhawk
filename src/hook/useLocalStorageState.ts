import { useState, useEffect } from 'react';

/**
 * Use local storage for state, adapted from https://www.robinwieruch.de/local-storage-react
 * @param localStorageKey key in local storage to store state
 * @param defaultVal default value if no value currently exists in local storage
 */
export function useLocalStorageState<T>(
    localStorageKey: string,
    defaultVal: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    let storageVal: string | null = localStorage.getItem(localStorageKey);
    let finalVal: T;
    if (!storageVal) {
        finalVal = defaultVal;
    } else {
        finalVal = JSON.parse(storageVal);
    }
    const [val, setVal] = useState<T>(finalVal);

    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(val));
    }, [val, localStorageKey]);

    return [val, setVal];
}
