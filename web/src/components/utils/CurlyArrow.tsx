import { useRef, useEffect } from 'react'

import { useTheme } from '@mui/material'

type CurlyArrowProps = {
  startRef: React.RefObject<HTMLElement>
  endRef: React.RefObject<HTMLElement>
  alignment?: 'left' | 'right'
}

export const CurlyArrow = ({
  startRef,
  endRef,
  alignment,
}: CurlyArrowProps) => {
  const theme = useTheme()

  const arrowRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const checkAddSvg = () => {
      if (!startRef.current || !endRef.current || !arrowRef.current) {
        console.log('waiting for refs')
        setTimeout(checkAddSvg, 100)
        return
      }

      const startRect = startRef.current.getBoundingClientRect()
      const endRect = endRef.current.getBoundingClientRect()

      // calculate the start and end positions of the arrow
      let startX: number, startY: number, endX: number, endY: number
      if (alignment === 'left') {
        startX = startRect.x
        startY = startRect.y + startRect.height / 2
        endX = endRect.x
        endY = endRect.y + endRect.height / 2
      } else {
        startX = startRect.x + startRect.width
        startY = startRect.y + startRect.height / 2
        endX = endRect.x + endRect.width
        endY = endRect.y + endRect.height / 2
      }

      // calculate the control points for the curved arrow path
      const controlX1 = startX + (endX - startX) / 2
      const controlY1 = startY
      const controlX2 = controlX1
      const controlY2 = endY

      // set the path of the arrow
      const path = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`

      // set the arrow path
      arrowRef.current.setAttribute('d', path)
      arrowRef.current.setAttribute('fill', 'none')
      arrowRef.current.setAttribute('stroke', theme.palette.primary.main)
      arrowRef.current.setAttribute('stroke-width', theme.spacing(2).toString())
    }

    checkAddSvg()
  }, [startRef, endRef, theme.palette.primary.main, theme, alignment])

  return (
    <svg
      ref={arrowRef}
      style={{
        position: 'absolute',
        left: alignment === 'left' ? 0 : '100px',
        right: alignment === 'left' ? '100px' : 0,
      }}
    />
  )
}
