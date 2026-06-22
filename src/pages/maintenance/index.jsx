import React, { useState } from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { 
  AlertOctagon, 
  RefreshCw, 
  Home, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Terminal 
} from "lucide-react";

export default function ErrorPage({ error: propError, resetErrorBoundary }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Safely get route error from react-router if available
  let routerError = null;
  try {
    routerError = useRouteError();
  } catch (e) {
    // Router context might not be available if caught by high-level App ErrorBoundary
  }

  const error = propError || routerError;

  // Determine error info
  let errorName = "Application Error";
  let errorMessage = "An unexpected runtime error occurred.";
  let errorDetails = "";
  let errorStatus = "";

  if (error) {
    if (typeof error === "object") {
      errorName = error.name || errorName;
      errorMessage = error.message || errorMessage;
      errorDetails = error.stack || "";
      
      // If it's a react-router Response object
      if (error.status) {
        errorStatus = `${error.status} ${error.statusText || ""}`;
        if (error.data) {
          errorMessage = typeof error.data === "string" ? error.data : JSON.stringify(error.data);
        }
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }
  }

  const handleCopy = () => {
    const copyText = `Error: ${errorName}\nStatus: ${errorStatus || "N/A"}\nMessage: ${errorMessage}\n\nStack Trace:\n${errorDetails || "No stack trace available."}`;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    try {
      navigate("/");
    } catch (e) {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-4 md:p-8 overflow-y-auto selection:bg-primary/20">
      <div className="max-w-2xl w-full bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-glow text-center animate-fade-in-up">
        {/* Animated Error Badge */}
        <div className="flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <AlertOctagon className="h-10 w-10 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive"></span>
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Oops! <span className="text-gradient">Screen Blocked</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            The application encountered a runtime error that prevented the page from rendering properly.
          </p>
        </div>

        {/* Main Error Callout */}
        <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <Terminal className="h-4 w-4" />
            <span>{errorName}</span>
            {errorStatus && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-destructive/15">
                {errorStatus}
              </span>
            )}
          </div>
          <p className="text-sm font-mono text-foreground/90 break-words leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {/* Technical Details Accordion */}
        {errorDetails && (
          <div className="border border-border rounded-2xl overflow-hidden bg-card/40 transition-all duration-300">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors text-muted-foreground cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>Technical details (Stack Trace)</span>
              </span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDetails && (
              <div className="border-t border-border p-4 bg-muted/20 text-left animate-fade-in-up">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground font-mono">Trace Output</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 px-2.5 py-1 rounded-lg border border-border/80 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-success animate-scale-up" />
                        <span className="text-success">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy trace</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto max-h-60 p-3 bg-card border border-border/60 rounded-xl whitespace-pre leading-relaxed select-text sidebar-scroll">
                  {errorDetails}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReload}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl gradient-primary text-white font-medium shadow-glow hover:opacity-95 active:scale-98 transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Page</span>
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-border bg-card hover:bg-accent text-foreground font-medium active:scale-98 transition-all duration-200 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </button>
        </div>

        <div className="text-xs text-muted-foreground/75">
          If this issue persists, please copy the error trace and send it to your development team.
        </div>
      </div>
    </div>
  );
}
