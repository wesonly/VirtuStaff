interface VideoPlaceholderProps {
  title: string;
  duration: string;
  thumbnailColor?: string;
}

export function VideoPlaceholder({
  title,
  duration,
  thumbnailColor = "from-gray-700 to-gray-800",
}: VideoPlaceholderProps) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-xl">
      <div
        className={`flex aspect-video items-center justify-center bg-gradient-to-br ${thumbnailColor} transition-transform duration-300 group-hover:scale-105`}
      >
        {/* Play button */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
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
  );
}
