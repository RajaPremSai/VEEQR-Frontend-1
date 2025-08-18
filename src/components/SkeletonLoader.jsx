export default function SkeletonLoader({
  type = "text",
  lines = 3,
  width = "100%",
  height = "1rem",
  className = "",
}) {
  if (type === "text") {
    return (
      <div className={`skeleton-text-container ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="skeleton-line"
            style={{
              width: index === lines - 1 ? "75%" : width,
              height: height,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`skeleton-card ${className}`}>
        <div className="skeleton-card-header">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-card-title">
            <div
              className="skeleton-line"
              style={{ width: "60%", height: "1rem" }}
            ></div>
            <div
              className="skeleton-line"
              style={{ width: "40%", height: "0.875rem" }}
            ></div>
          </div>
        </div>
        <div className="skeleton-card-content">
          <div
            className="skeleton-line"
            style={{ width: "100%", height: "0.875rem" }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: "90%", height: "0.875rem" }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: "75%", height: "0.875rem" }}
          ></div>
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={`skeleton-table ${className}`}>
        <div className="skeleton-table-header">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-table-cell skeleton-table-header-cell"
            >
              <div
                className="skeleton-line"
                style={{ width: "80%", height: "1rem" }}
              ></div>
            </div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table-row">
            {Array.from({ length: 4 }).map((_, cellIndex) => (
              <div key={cellIndex} className="skeleton-table-cell">
                <div
                  className="skeleton-line"
                  style={{ width: "70%", height: "0.875rem" }}
                ></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default rectangle skeleton
  return (
    <div
      className={`skeleton-rectangle ${className}`}
      style={{ width, height }}
    />
  );
}
