import { useEffect, useState } from 'react'

/**
 * Detects when the browser tab was put to sleep and reloads the page if it was.
 */
export const SleepDetector = () => {
  const [lastChecked, setLastChecked] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const timeNow = Date.now()
      if (timeNow - lastChecked > 10000) {
        window.location.reload()
      }

      setLastChecked(timeNow)
    }, 2000)

    return () => clearInterval(interval)
  }, [lastChecked])

  return <></>
}
