"use client";

import React from "react";
import { CommercialQuery } from "@/types";
import { cn } from "@/lib/utils"; // Assuming cn utility for tailwind-merge
import InteractiveHighlight from "./InteractiveHighlight"; // Import the new component

interface HighlightedScriptProps {
  scriptText: string;
  commercialQueries: CommercialQuery[];
  onToggleQueryStatus: (id: string, checked: boolean) => void; // New prop for toggling status
}

const HighlightedScript: React.FC<HighlightedScriptProps> = ({
  scriptText,
  commercialQueries,
  onToggleQueryStatus,
}) => {
  if (!scriptText) {
    return <p className="text-gray-500 dark:text-gray-400">No script content to display.</p>;
  }

  // Create a sorted list of all highlight ranges
  const highlights: { start: number; end: number; query: CommercialQuery }[] = [];
  commercialQueries.forEach(query => {
    highlights.push({
      start: query.startIndex,
      end: query.endIndex,
      query: query,
    });
  });

  // Sort highlights by their start index
  highlights.sort((a, b) => a.start - b.start);

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  highlights.forEach((highlight, index) => {
    // Add text before the current highlight
    if (highlight.start > lastIndex) {
      elements.push(scriptText.substring(lastIndex, highlight.start));
    }

    // Add the highlighted text using the InteractiveHighlight component
    elements.push(
      <InteractiveHighlight
        key={`${highlight.query.id}-${index}`}
        query={highlight.query}
        onToggleStatus={onToggleQueryStatus}
      >
        {scriptText.substring(highlight.start, highlight.end)}
      </InteractiveHighlight>
    );

    lastIndex = Math.max(lastIndex, highlight.end);
  });

  // Add any remaining text after the last highlight
  if (lastIndex < scriptText.length) {
    elements.push(scriptText.substring(lastIndex));
  }

  return (
    <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
      {elements}
    </p>
  );
};

export default HighlightedScript;