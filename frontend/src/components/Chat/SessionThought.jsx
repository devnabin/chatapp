import { useState } from "react";

// "What's on your mind?" note for the current session
function SessionThought({ send_thought }) {
  const [thought, setThought] = useState("");
  const [display, setDisplay] = useState("");
  const canSet = Boolean(thought.trim());

  function handleDelete() {
    setThought("");
  }

  function saved_thought(thought) {
    setDisplay(thought.trim());
    send_thought(thought.trim());
    setThought("");
  }

  return (
    <section
      className="border-t border-secondary/50 p-5 sm:p-6"
      aria-labelledby="settings-title"
    >
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="session-thought" className="text-sm font-medium">
          What's on your mind?
        </label>
        <div className="flex items-center gap-1">
          {display ? (
            <button
              type="button"
              onClick={() => {
                setThought(display);
                setDisplay("");
              }}
              className="h-7 rounded-full bg-primary px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => saved_thought(thought)}
              disabled={!canSet}
              className="h-7 rounded-full bg-primary px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Set
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={!thought}
            aria-label="Delete thought"
            title="Delete thought"
            className="flex h-7 w-7 items-center justify-center rounded-full text-text/60 transition-colors hover:bg-[#d64c63]/12 hover:text-[#d64c63] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text/60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {display ? (
        <p className="flex min-h-21 items-center justify-center rounded-xl border border-secondary/50 bg-secondary/10 px-4 py-3 text-center text-sm italic leading-relaxed whitespace-pre-wrap wrap-break-word">
          “{display}”
        </p>
      ) : (
        <textarea
          id="session-thought"
          rows={3}
          value={thought}
          maxLength={140}
          onChange={(event) => setThought(event.target.value)}
          placeholder="Share a thought for this session..."
          className="w-full resize-none rounded-xl border border-secondary/50 bg-secondary/10 px-4 py-3 text-sm leading-relaxed transition-colors placeholder:text-text/40 focus:border-primary focus:outline-none"
        />
      )}
    </section>
  );
}

export default SessionThought;
