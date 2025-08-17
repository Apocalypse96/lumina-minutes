"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { APILoadingState } from "@/components/LoadingStates";
import { validateTranscript, validateInstruction } from "@/lib/rate-limiter";
import ThemeToggle from "@/components/ThemeToggle";

export default function UploadPage() {
  const [transcript, setTranscript] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setTranscript(text);
          setFileName(file.name);
        };
        reader.readAsText(file);
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Please upload a .txt file");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) {
      toast.error("Please provide a transcript");
      return;
    }

    // Client-side validation
    if (!validateTranscript(transcript)) {
      toast.error("Transcript must be between 10 and 50,000 characters");
      return;
    }

    if (customInstruction && !validateInstruction(customInstruction)) {
      toast.error("Custom instruction must be 500 characters or less");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          instruction: customInstruction.trim() || "Please provide a clear, structured summary of this meeting transcript.",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast.error(`Rate limit exceeded. Please try again in ${errorData.retryAfter || 'a few'} seconds.`);
          return;
        }
        
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const data = await response.json();
      
      // Store in localStorage for history
      const history = JSON.parse(localStorage.getItem("lumina-history") || "[]");
      const newEntry = {
        id: Date.now(),
        transcript: transcript.substring(0, 100) + "...",
        summary: data.summary,
        instruction: customInstruction || "Default summary",
        timestamp: new Date().toISOString(),
      };
      
      const updatedHistory = [newEntry, ...history.slice(0, 2)]; // Keep only last 3
      localStorage.setItem("lumina-history", JSON.stringify(updatedHistory));
      
      // Navigate to summary page with data
      const url = `/summary?data=${encodeURIComponent(JSON.stringify(newEntry))}`;
      console.log("Upload page - navigating to:", url);
      console.log("Upload page - newEntry:", newEntry);
      router.push(url);
    } catch (error) {
      console.error("Summary generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LuminaMinutes
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Your Meeting Transcript
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get AI-powered summaries in seconds
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* File Upload Section */}
            <div className="mb-8">
              <Label htmlFor="file-upload" className="text-lg font-semibold text-gray-900 dark:text-white mb-4 block">
                Upload Transcript File
              </Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </label>{" "}
                  or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Only .txt files are supported
                </p>
              </div>
              
              {fileName && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-900 dark:text-blue-100 font-medium">{fileName}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearTranscript}>
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Or Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
              </div>
            </div>

            {/* Text Input Section */}
            <div className="mb-8">
              <Label htmlFor="transcript" className="text-lg font-semibold text-gray-900 dark:text-white mb-4 block">
                Paste Transcript Text
              </Label>
              <Textarea
                id="transcript"
                placeholder="Paste your meeting transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[200px] text-base"
                disabled={isLoading}
              />
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {transcript.length} characters
              </div>
            </div>

            {/* Custom Instruction Section */}
            <div className="mb-8">
              <Label htmlFor="instruction" className="text-lg font-semibold text-gray-900 dark:text-white mb-4 block">
                Custom Instruction <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="instruction"
                placeholder="e.g., 'Summarize in bullet points' or 'Extract action items only'"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                className="text-base"
                disabled={isLoading}
              />
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Leave empty for a general summary
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <Button
                onClick={handleGenerateSummary}
                disabled={!transcript.trim() || isLoading}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>

            {/* API Loading State */}
            {isLoading && (
              <APILoadingState message="Generating your AI summary..." />
            )}

            {/* Tips */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Tips for Better Summaries</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <Badge variant="secondary" className="mb-2">File Format</Badge>
                  <p>Upload .txt files for best results. Ensure proper formatting and punctuation.</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">Instructions</Badge>
                  <p>Be specific with custom instructions. Try &quot;Focus on action items&quot; or &quot;Summarize key decisions&quot;.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
