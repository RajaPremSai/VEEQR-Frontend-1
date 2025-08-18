import { useState, useRef, useEffect } from "react";
import { getOptimalImageSize } from "../utils/performance";

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  placeholder = null,
  lazy = true,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  // Optimize image size based on device capabilities
  const optimizedWidth = width ? getOptimalImageSize(width) : width;
  const optimizedHeight = height ? getOptimalImageSize(height) : height;

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={{
        width: optimizedWidth,
        height: optimizedHeight,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Placeholder while loading */}
      {!loaded && (
        <div className="image-placeholder">
          {placeholder || (
            <div className="placeholder-content">
              <div className="placeholder-icon">🖼️</div>
              <div className="placeholder-text">Loading...</div>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="image-error">
          <div className="error-icon">❌</div>
          <div className="error-text">Failed to load image</div>
        </div>
      )}

      {/* Actual image */}
      {inView && (
        <img
          src={src}
          alt={alt}
          width={optimizedWidth}
          height={optimizedHeight}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          style={{
            opacity: loaded && !error ? 1 : 0,
            transition: "opacity 0.3s ease",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
}
