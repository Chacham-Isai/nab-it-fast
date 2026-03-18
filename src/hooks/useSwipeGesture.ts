import { useRef, useState, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeState {
  deltaX: number;
  deltaY: number;
  swiping: boolean;
}

export const useSwipeGesture = (
  handlers: SwipeHandlers,
  { threshold = 50, preventScroll = false } = {}
) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const [state, setState] = useState<SwipeState>({ deltaX: 0, deltaY: 0, swiping: false });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setState({ deltaX: 0, deltaY: 0, swiping: true });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startX.current && !startY.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (preventScroll && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
    setState({ deltaX: dx, deltaY: dy, swiping: true });
  }, [preventScroll]);

  const onTouchEnd = useCallback(() => {
    const { deltaX, deltaY } = state;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY && absX > threshold) {
      if (deltaX > 0) handlers.onSwipeRight?.();
      else handlers.onSwipeLeft?.();
    } else if (absY > absX && absY > threshold) {
      if (deltaY > 0) handlers.onSwipeDown?.();
      else handlers.onSwipeUp?.();
    }

    setState({ deltaX: 0, deltaY: 0, swiping: false });
    startX.current = 0;
    startY.current = 0;
  }, [state, handlers, threshold]);

  return {
    swipeHandlers: { onTouchStart, onTouchMove, onTouchEnd },
    ...state,
  };
};
