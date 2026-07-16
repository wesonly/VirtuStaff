import { useState, useCallback, useEffect } from "react";

interface VideoPlaceholderProps {
  title: string;
  duration: string;
  thumbnailColor?: string;
  videoUrl?: string;
}

export function VideoPlaceholder({
  title,
  duration,
  thumbnailColor = "from-gray-700 to-gray-800",
  videoUrl,
}: VideoPlaceholderProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const open = useCallback(() => {
    if (videoUrl) setModalOpen(true);
  }, [videoUrl]);

  const close = useCallback(() => setModalOpen(false), []);

  // Close on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen, close]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  return (
    <>
      {/* Thumbnail / Play button */}
      <div
        className={`group relative overflow-hidden rounded-xl ${videoUrl ? "cursor-pointer" : ""}`}
        onClick={open}
        role={videoUrl ? "button" : undefined}
        tabIndex={videoUrl ? 0 : undefined}
        onKeyDown={videoUrl ? (e) => e.key === "Enter" && open() : undefined}
      >
        <div
          className={`flex aspect-video items-center justify-center bg-gradient-to-br ${thumbnailColor} transition-transform duration-300 ${videoUrl ? "group-hover:scale-105" : ""}`}
        >
          {/* Play button */}
          <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-300 ${videoUrl ? "group-hover:scale-110 group-hover:bg-white" : ""}`}>
            <svg
              className="ml-1.5 h-7 w-7 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {duration}
        </span>

        {/* Title overlay */}
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </p>
      </div>

      {/* Video Modal */}
      {modalOpen && videoUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={close}
        >
          {/* Dark overlay backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative z-10 w-full max-w-4xl animate-in zoom-in-95 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute -top-10 right-0 rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white sm:-top-12 sm:-right-12"
              title="Close video"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video iframe container — 16:9 aspect ratio */}
            <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-2xl" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={`${videoUrl}?autoplay=1&rel=0`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${title} — demo video`}
              />
            </div>

            {/* Video title bar */}
            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                  VS
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-white/60">VirtuStaff Demo · {duration}</p>
                </div>
              </div>
              <button
                onClick={close}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
