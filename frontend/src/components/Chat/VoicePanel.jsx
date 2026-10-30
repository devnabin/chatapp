import "./VoicePanel.css";
import SessionThought from "./SessionThought";

function VoicePanel({
  listening,
  ai_response,
  browserSupportsTextToSpeech,
  isInQueue,
  isAutoSpeaking,
  stop_speech,
  start,
  isVoiceBusy,
  start_audio,
  end_audio,
  transcript,
  isConnected,
  browserSupportsSpeechRecognition,
  isMicrophoneAvailable,
  send_thought
}) {
  return (
        <aside className="dashboard-panel" aria-labelledby="voice-title">
          <div className="min-h-0 overflow-y-auto">
          <div className="m-auto w-full max-w-lg p-5 text-center sm:p-6">
            <h2 id="voice-title" className="mb-4 text-2xl font-bold">Voice Chat with Bin AI</h2>
            <div className="mb-6 flex items-center justify-center gap-3">
              <span
                role="status"
                aria-label={listening ? "Microphone on" : "Microphone off"}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${listening ? "animate-pulse bg-primary/15 text-primary shadow-[0_0_16px_4px] shadow-primary/50 ring-2 ring-primary/60" : "bg-secondary/20 text-text/50"}`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
                </svg>
              </span>
              {ai_response && browserSupportsTextToSpeech && (
                <button
                  type="button"
                  onClick={isInQueue || isAutoSpeaking ? stop_speech : start}
                  disabled={listening || isVoiceBusy}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
                >
                  <span aria-hidden="true">{isInQueue || isAutoSpeaking ? "■" : "▶"}</span>
                  {isInQueue || isAutoSpeaking ? "Stop audio" : "Play audio"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={start_audio} disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable || listening || isVoiceBusy} className="h-9 rounded-full bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40">Start</button>
              <button type="button" onClick={() => end_audio()} disabled={!transcript.trim() || !isConnected || isVoiceBusy} className="h-9 rounded-full bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-40">Send</button>
              <button type="button" onClick={() => end_audio(false)} disabled={(!listening && !transcript) || isVoiceBusy} className="h-9 rounded-full px-4 text-sm font-medium text-text/70 transition-colors hover:bg-secondary/20 hover:text-text disabled:opacity-40">Reset</button>
            </div>
            <p aria-live="polite" className="mt-6 h-40 overflow-y-auto whitespace-pre-wrap wrap-break-word rounded-xl border border-secondary/50 bg-secondary/10 p-4 leading-relaxed">
              {transcript || "Your speech will appear here."}
            </p>
            {!browserSupportsSpeechRecognition && (
              <p className="mt-4 text-sm text-text/70">Voice input is unavailable in this browser. You can type to Bin Chat and play its replies.</p>
            )}
            {browserSupportsSpeechRecognition && !isMicrophoneAvailable && (
              <p role="alert" className="mt-4 text-sm text-text/70">Microphone access is unavailable. Check your browser's microphone permission and input device, then reload.</p>
            )}
          </div>
          <div>
            <SessionThought send_thought={send_thought} />
          </div>
          </div>
        </aside>
  );
}


export default VoicePanel;
