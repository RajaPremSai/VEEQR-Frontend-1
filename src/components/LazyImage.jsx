import { useState, useRef, useEffect } from "react";
import { getOptimalImageSize } from "../utils/performance";

export default function LazyImage({
  src,
  alt,
  className = "",
  placeholder = "/placeholder.svg",
  width,
  height,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  // Optimize image size based on device capabilities
  const optimizedWidth = width ? getOptimalImageSize(width) : width;

  return (
    <div
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{ width: optimizedWidth, height }}
    >
      {!isInView && (
        <div className="lazy-image-placeholder">
          <img
            src={placeholder}
            alt=""
            className="placeholder-img"
            style={{ width: optimizedWidth, height }}
          />
        </div>
      )}

      {isInView && (
        <img
          src={error ? placeholder : src}
          alt={alt}
          className={`lazy-image ${isLoaded ? "loaded" : "loading"}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ width: optimizedWidth, height }}
          {...props}
        />
      )}
    </div>
  );
}
