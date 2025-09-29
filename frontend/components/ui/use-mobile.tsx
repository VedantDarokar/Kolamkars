"use client"

import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Initialize from the media query itself
    setIsMobile(mql.matches)

    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const matches = (event as MediaQueryListEvent).matches ?? (event as MediaQueryList).matches
      setIsMobile(matches)
    }

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange as unknown as EventListener)
    } else if (typeof (mql as any).addListener === 'function') {
      ;(mql as any).addListener(onChange)
    }

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onChange as unknown as EventListener)
      } else if (typeof (mql as any).removeListener === 'function') {
        ;(mql as any).removeListener(onChange)
      }
    }
  }, [])

  return !!isMobile
}
