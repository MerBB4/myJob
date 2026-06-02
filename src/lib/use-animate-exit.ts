'use client'

import { useState, useEffect } from 'react'

/**
 * Manages enter/exit animations for conditional UI elements.
 * When `visible` becomes true: immediately shows with enter animation.
 * When `visible` becomes false: applies exit animation, then removes after delay.
 */
export function useAnimateExit(
  visible: boolean,
  enterClass: string,
  exitClass: string,
  exitMs = 150
): { show: boolean; animClass: string } {
  const [show, setShow] = useState(visible)
  const [animClass, setAnimClass] = useState(visible ? enterClass : '')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (visible) {
      setShow(true)
      setAnimClass(enterClass)
    } else if (show) {
      setAnimClass(exitClass)
      timer = setTimeout(() => {
        setShow(false)
        setAnimClass('')
      }, exitMs)
    }

    return () => clearTimeout(timer)
  }, [visible])

  return { show, animClass }
}
