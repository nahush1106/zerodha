import React from "react";

// If any component crashes while rendering, show this instead of a blank page
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Dashboard crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <h3 style={{ fontWeight: 400 }}>Something went wrong</h3>
          <p style={{ color: "#9b9b9b" }}>
            Please reload the page. If it keeps happening, log in again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "2px",
              background: "#4184f3",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
