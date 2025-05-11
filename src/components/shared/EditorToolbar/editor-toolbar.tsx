"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ToolbarAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tooltip?: string;
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}

export interface ToolbarToggle {
  id: string;
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

export interface ToolbarSelect<T extends string> {
  id: string;
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{
    value: T;
    label: string;
  }>;
  width?: string;
}

export interface ToolbarTitle {
  text: string;
}

export interface EditorToolbarProps {
  title?: ToolbarTitle;
  actions?: ToolbarAction[];
  toggles?: ToolbarToggle[];
  selects?: ToolbarSelect<any>[];
  className?: string;
  darkMode?: boolean;
}

export function EditorToolbar({
  title,
  actions = [],
  toggles = [],
  selects = [],
  className = "",
  darkMode = true,
}: EditorToolbarProps) {
  // Base styles that can be overridden with className
  const baseClasses = `flex items-center justify-between px-4 py-2 border-b ${
    darkMode ? "bg-gray-950 border-gray-700" : "bg-white border-gray-200"
  } ${className}`;

  // Text color based on dark mode
  const textColor = darkMode ? "text-gray-100" : "text-gray-900";
  const labelColor = darkMode ? "text-gray-300" : "text-gray-700";

  // Button styles based on dark mode
  const buttonBaseClasses = darkMode
    ? "border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
    : "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100";

  return (
    <div className={baseClasses}>
      <div className="flex items-center gap-4">
        {/* Title */}
        {title && (
          <h2 className={`text-lg font-semibold ${textColor}`}>{title.text}</h2>
        )}

        {/* Toggles */}
        {toggles.map((toggle) => (
          <div key={toggle.id} className="flex items-center gap-1">
            <Label htmlFor={toggle.id} className={`text-sm mr-1 ${labelColor}`}>
              {toggle.label}
            </Label>
            <Switch
              id={toggle.id}
              checked={toggle.isChecked}
              onCheckedChange={toggle.onChange}
            />
          </div>
        ))}

        {/* Selects */}
        <div className="flex items-center gap-5">
          {selects.map((select) => (
            <div key={select.id}>
              {select.label && (
                <Label
                  htmlFor={select.id}
                  className={`text-sm mr-2 ${labelColor}`}
                >
                  {select.label}
                </Label>
              )}
              <Select value={select.value} onValueChange={select.onChange}>
                <SelectTrigger
                  className={`h-8 ${select.width || "w-24"} ${
                    darkMode
                      ? "border-gray-900 bg-gray-950 text-gray-100"
                      : "border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent
                  className={
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-200 text-gray-800"
                  }
                >
                  {select.options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={
                        darkMode
                          ? "focus:bg-gray-700 focus:text-gray-100"
                          : "focus:bg-gray-100 focus:text-gray-800"
                      }
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <TooltipProvider key={action.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={buttonBaseClasses}
                  >
                    {action.icon}
                    {action.label && (
                      <span className="ml-2">{action.label}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {action.tooltip && (
                  <TooltipContent>
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  );
}
