import { useState, useEffect, useRef, useMemo } from "react";
import { throttle } from "../utils/performance";

export default function VirtualList({
  items,
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = "",
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Throttled scroll handler
  const handleScroll = useMemo(
    () =>
      throttle((e) => {
        setScrollTop(e.target.scrollTop);
      }, 16), // ~60fps
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{
        height: containerHeight,
        overflow: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {items
            .slice(visibleRange.start, visibleRange.end)
            .map((item, index) => (
              <div
                key={visibleRange.start + index}
                style={{
                  height: itemHeight,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {renderItem(item, visibleRange.start + index)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
