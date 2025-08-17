"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SummaryEditorProps {
  summary: string;
  onSave: (editedSummary: string) => void;
  onCancel: () => void;
}

export default function SummaryEditor({ summary, onSave, onCancel }: SummaryEditorProps) {
  const [editedSummary, setEditedSummary] = useState(summary);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Edit Summary (Markdown formatting will be applied)
        </Label>
        <Textarea
          value={editedSummary}
          onChange={(e) => setEditedSummary(e.target.value)}
          className="min-h-[400px] text-base resize-none font-mono"
          placeholder="Edit your summary here... (Markdown formatting: **bold**, * bullet points)"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <p><strong>Markdown Tips:</strong></p>
          <p>• <code>**text**</code> = <strong>bold</strong></p>
          <p>• <code>* item</code> = bullet points</p>
          <p>• <code># Heading</code> = headers</p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedSummary)}>
          Save Edits
        </Button>
      </div>
    </div>
  );
}
