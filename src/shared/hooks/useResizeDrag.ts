import { useState, useRef, useCallback } from 'react';

export function useResizeDrag(
  initial: number,
  direction: 'x' | 'y',
  min: number,
  max: number,
) {
  const [size, setSize] = useState(initial);
  const sizeRef = useRef(initial);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startPos = direction === 'x' ? e.clientX : e.clientY;
      const startSize = sizeRef.current;

      const onMove = (me: MouseEvent) => {
        const delta = (direction === 'x' ? me.clientX : me.clientY) - startPos;
        const next = Math.min(max, Math.max(min, startSize + delta));
        sizeRef.current = next;
        setSize(next);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [direction, min, max],
  );

  return { size, onMouseDown };
}
