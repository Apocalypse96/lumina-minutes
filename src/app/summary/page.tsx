"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit3, Share2, Download, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import DynamicSummaryEditor from "@/components/DynamicSummaryEditor";
import { SummaryPageSkeleton } from "@/components/LoadingStates";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThemeToggle from "@/components/ThemeToggle";

interface SummaryData {
  id: number;
  transcript: string;
  summary: string;
  instruction: string;
  timestamp: string;
}

function SummaryContent() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [editedSummary, setEditedSummary] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const dataParam = searchParams.get("data");
    console.log("Summary page - dataParam:", dataParam);
    
    if (dataParam) {
      try {
        const data = JSON.parse(dataParam);
        console.log("Summary page - parsed data:", data);
        setSummaryData(data);
        setEditedSummary(data.summary);
      } catch (error) {
        console.error("Summary page - parsing error:", error);
        toast.error("Failed to load summary data");
      }
    } else {
      console.log("Summary page - no data parameter found");
      // Fallback: try to get the latest summary from localStorage
      const history = JSON.parse(localStorage.getItem("lumina-history") || "[]");
      if (history.length > 0) {
        console.log("Summary page - using localStorage fallback:", history[0]);
        setSummaryData(history[0]);
        setEditedSummary(history[0].summary);
      }
    }
  }, [searchParams]);

  const handleSaveEdits = () => {
    if (summaryData) {
      setSummaryData({
        ...summaryData,
        summary: editedSummary,
      });
      
      // Update localStorage
      const history = JSON.parse(localStorage.getItem("lumina-history") || "[]");
      const updatedHistory = history.map((item: SummaryData) =>
        item.id === summaryData.id ? { ...item, summary: editedSummary } : item
      );
      localStorage.setItem("lumina-history", JSON.stringify(updatedHistory));
      
      setIsEditing(false);
      toast.success("Edits saved successfully!");
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary);
      setCopied(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  const handleDownloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([editedSummary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `meeting-summary-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Summary downloaded!");
  };

  const handleSendEmail = async () => {
    if (!emailRecipients.trim()) {
      toast.error("Please enter recipient email addresses");
      return;
    }

    if (!summaryData) {
      toast.error("No summary data available");
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: emailRecipients.split(",").map(email => email.trim()),
          summary: editedSummary,
          instruction: summaryData.instruction,
          timestamp: summaryData.timestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast.success(data.message || "Email sent successfully!");
      setIsEmailModalOpen(false);
      setEmailRecipients("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Summary Data Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please generate a summary first by uploading a transcript.
          </p>
          <Link href="/upload">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Go to Upload
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
              <span className="text-white font-bold text-lg">L</span>
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
        <div className="max-w-6xl mx-auto">
          {/* Summary Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Meeting Summary
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Generated: {new Date(summaryData.timestamp).toLocaleString()}</span>
                  {summaryData.instruction !== "Default summary" && (
                    <Badge variant="secondary">{summaryData.instruction}</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? "Cancel Edit" : "Edit Summary"}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCopySummary}
                  className="flex items-center space-x-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownloadSummary}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            {/* Summary Content */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              {isEditing ? (
                <DynamicSummaryEditor
                  summary={editedSummary}
                  onSave={(editedSummary) => {
                    setEditedSummary(editedSummary);
                    handleSaveEdits();
                  }}
                  onCancel={() => {
                    setIsEditing(false);
                    setEditedSummary(summaryData?.summary || "");
                  }}
                />
              ) : (
                <div className="prose prose-gray dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                  <ReactMarkdown 
                    components={{
                      h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{children}</h3>,
                      p: ({children}) => <p className="mb-3">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                    }}
                  >
                    {editedSummary}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Share Your Summary
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Send this summary to your team members via email
              </p>
              
              <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share via Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send Summary via Email</DialogTitle>
                    <DialogDescription>
                      Enter the email addresses of the people you want to share this summary with.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="recipients" className="text-sm font-medium text-gray-700 dark:text-gray-300">Recipient Email Addresses</label>
                      <Input
                        id="recipients"
                        placeholder="email1@example.com, email2@example.com"
                        value={emailRecipients}
                        onChange={(e) => setEmailRecipients(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Separate multiple emails with commas
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsEmailModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendEmail}
                        disabled={isSending || !emailRecipients.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isSending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          "Send Email"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Generate New Summary */}
          <div className="text-center mt-8">
            <Link href="/upload">
              <Button variant="outline" size="lg" className="px-8 py-4">
                Generate New Summary
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SummaryPageSkeleton />}>
        <SummaryContent />
      </Suspense>
    </ErrorBoundary>
  );
}
