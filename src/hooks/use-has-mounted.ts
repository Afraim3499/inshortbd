'use client'

import { useSyncExternalStore } from 'react'

/**
 * A SSR-safe hook that returns true only after the component has mounted on the client.
 * Uses useSyncExternalStore for hydration safety without triggering lint warnings.
 * 
 * Use this instead of the pattern: 
 *   const [mounted, setMounted] = useState(false);
 *   useEffect(() => setMounted(true), []);
 * 
 * @example
 * const hasMounted = useHasMounted();
 * if (!hasMounted) return <Fallback />;
 */

// Subscribe is a no-op since mount state never changes after initial mount
const subscribe = () => () => { }

// Server always returns false
const getServerSnapshot = () => false

// Client always returns true (called only after hydration)
const getClientSnapshot = () => true

export function useHasMounted(): boolean {
    return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
