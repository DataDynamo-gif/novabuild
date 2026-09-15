"use client";

import { useState } from "react";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Sparkles, 
  Copy, 
  Download, 
  History, 
  Terminal, 
  Send, 
  Code2, 
  CheckCircle2,
  Cpu
} from "lucide-react";

export default function Home() {
  const { user, isSignedIn } = useUser();
  const [prompt, setPrompt] = useState("");
  const [techStack, setTechStack] = useState("Next.js & TypeScript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Convex History Query & Mutation
  const history = useQuery(
    api.projects.getUserProjects, 
    user ? { userId: user.id } : "skip"
  );
  const saveProjectMutation = useMutation(api.projects.saveProject);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, techStack }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate response from server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setResult(accumulatedText);
      }

      // Save to Convex Database if user is signed in
      if (isSignedIn && user) {
        await saveProjectMutation({
          userId: user.id,
          prompt,
          techStack,
          result: accumulatedText,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate project.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([result], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "nova-blueprint.md";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            NovaBuild
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded-xl transition cursor-pointer border border-slate-700">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-blue-600/20">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <UserButton />
          )}
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar - History */}
        <aside className="md:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 h-[calc(100vh-140px)] sticky top-24 overflow-y-auto">
          <div className="flex items-center gap-2 font-semibold text-slate-300 pb-2 border-b border-slate-800">
            <History className="w-4 h-4 text-blue-400" />
            <span>Project History</span>
          </div>

          {!isSignedIn ? (
            <p className="text-xs text-slate-500">Sign in to save and view your past generated blueprints.</p>
          ) : history === undefined ? (
            <p className="text-xs text-slate-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-slate-500">No past blueprints yet. Generate one!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => {
                    setPrompt(item.prompt);
                    setTechStack(item.techStack);
                    setResult(item.result);
                  }}
                  className="bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 p-2.5 rounded-xl cursor-pointer transition text-xs flex flex-col gap-1"
                >
                  <span className="font-medium text-slate-300 truncate">{item.prompt}</span>
                  <span className="text-[10px] text-blue-400">{item.techStack}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Center Panel - Generator */}
        <section className="md:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Code2 className="w-6 h-6 text-blue-500" />
                AI Project Architect
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Select your tech stack, describe your vision, and stream production-ready architecture instantly.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  Target Tech Stack
                </label>
                <select 
                  value={techStack} 
                  onChange={(e) => setTechStack(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="Next.js & TypeScript">Next.js & TypeScript</option>
                  <option value="React & Tailwind CSS">React & Tailwind CSS</option>
                  <option value="Node.js & Express">Node.js & Express</option>
                  <option value="Python & FastAPI">Python & FastAPI</option>
                  <option value="Vue.js & Tailwind">Vue.js & Tailwind</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Project Description / Prompt</label>
                <textarea
                  className="bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  rows={4}
                  placeholder="e.g., Build a modern SaaS analytics dashboard with real-time charts and dark mode..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/25 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Streaming Architecture...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Blueprint ⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/50 text-red-400 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Generated Output Blueprint
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyToClipboard} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button 
                    onClick={downloadMarkdown} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .md
                  </button>
                </div>
              </div>
              <div className="bg-slate-950 text-emerald-400/90 p-5 rounded-xl border border-slate-900 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-[600px]">
                {result}
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}