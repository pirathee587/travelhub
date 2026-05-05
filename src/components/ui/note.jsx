import React from "react";
import clsx from "clsx";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";

const sizes = {
  small: "py-1.5 px-2 min-h-[34px] text-[13px]",
  medium: "py-2 px-3 min-h-10 text-[14px]",
  large: "py-[11px] px-3 min-h-12 text-base"
};

const linkColor = {
  default: "var(--ds-gray-1000)",
  success: "var(--ds-blue-1000)",
  warning: "var(--ds-amber-1000)",
  error: "var(--ds-red-1000)",
  alert: "var(--ds-red-1000)",
  secondary: "var(--ds-gray-1000)",
  violet: "var(--ds-purple-1000)",
  cyan: "var(--ds-teal-1000)",
  lite: "var(--ds-gray-1000)",
  ghost: "var(--ds-gray-1000)",
  tertiary: "var(--ds-gray-1000)",
  "rotate-ccw": "var(--ds-gray-1000)"
};

export const Note = ({
  size = "medium",
  action,
  type = "default",
  fill = false,
  disabled = false,
  label = true,
  children
}) => {
  return (
    <>
      <div
        style={{ "--geist-link-color": disabled ? "var(--ds-gray-700)" : linkColor[type] }}
        className={clsx(
          "flex items-start justify-between gap-3 rounded-md font-sans leading-6 selection:text-selection-text-color box-border border",
          sizes[size],
          (type === "default" || type === "tertiary" || type === "lite" || type === "ghost" || type === "rotate-ccw") && "text-gray-900 fill-gray-900 bg-transparent selection:bg-gray-900 border-gray-400",
          type === "success" && `text-blue-900 fill-blue-900 selection:bg-blue-700 ${fill ? "border-blue-100 bg-blue-200" : "border-blue-400 bg-transparent"}`,
          type === "warning" && `text-amber-900 fill-amber-900 selection:bg-amber-900 ${fill ? "border-amber-100 bg-amber-200" : "border-amber-400 bg-transparent"}`,
          (type === "error" || type === "alert") && `text-red-900 fill-red-900 selection:bg-red-800 ${fill ? "border-red-100 bg-red-200" : "border-red-400 bg-transparent"}`,
          type === "secondary" && `text-gray-900 fill-gray-900 selection:bg-gray-900 ${fill ? "border-transparent bg-gray-alpha-200" : "border-gray-alpha-400 bg-transparent"}`,
          type === "violet" && `text-purple-900 fill-purple-900 selection:bg-purple-900 ${fill ? "border-purple-100 bg-purple-200" : "border-purple-400 bg-transparent"}`,
          type === "cyan" && `text-teal-900 fill-teal-900 selection:bg-teal-900 ${fill ? "border-teal-100 bg-teal-200" : "border-teal-400 bg-transparent"}`,
          disabled ? "note-disabled text-gray-700 fill-gray-700 border-gray-alpha-200 bg-transparent selection:bg-gray-900" : "note-link"
        )}
      >
        <div className={clsx(
          "flex items-start m-0 flex-1",
          typeof label === "string" ? "gap-1" : size === "small" ? "gap-2" : "gap-3"
        )}>
          {((typeof label !== "string" && label !== false) || label === undefined) && (
            <div className="w-5 h-5 mt-0.5 shrink-0">
              {{
                default: <Info size={18} />,
                success: <CheckCircle2 size={18} />,
                warning: <AlertCircle size={18} />,
                error: <XCircle size={18} />,
                alert: <Info size={18} />,
                cyan: <Info size={18} />
              }[type] || <Info size={18} />}
            </div>
          )}
          {typeof label === "string" && (
            <span className="font-semibold whitespace-nowrap">{label}:</span>
          )}
          <span>
            {children}
          </span>
        </div>
        {action && (
          <div className="shrink-0">
             {action}
          </div>
        )}
      </div>
    </>
  );
};