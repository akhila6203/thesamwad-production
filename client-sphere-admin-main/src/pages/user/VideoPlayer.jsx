import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function getYouTubeVideoId(value) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(
      value.trim().startsWith("http")
        ? value.trim()
        : `https://${value.trim()}`
    );

    if (
      url.hostname === "youtu.be" ||
      url.hostname.endsWith(".youtu.be")
    ) {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtube-nocookie.com")
    ) {
      const videoId = url.searchParams.get("v");
      if (videoId) return videoId;

      const parts = url.pathname.split("/").filter(Boolean);

      if (["embed", "shorts", "live", "v"].includes(parts[0])) {
        return parts[1] || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function loadYouTubeAPI() {
  return new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT);
    };

    let script = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
}

export default function VideoPlayer({
  src,
  poster,
  title,
  subtitle,
  badge,
  className,
  initialTime = 0,
  initialWatchedRanges = [],
  trackProgress = false,
  onWatchProgress,
  onComplete,
}) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const youtubeMountRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [isFs, setIsFs] = useState(false);

  const youtubeId = getYouTubeVideoId(src);

  const watchedRangesRef = useRef([]);
  const lastSampleRef = useRef(null);
  const lastSavedRef = useRef(0);
  const completedRef = useRef(false);
  const saveTimerRef = useRef(null);

  const callbacksRef = useRef({});
  callbacksRef.current = {
    onWatchProgress,
    onComplete,
  };

  const initialTimeRef = useRef(initialTime);
  initialTimeRef.current = initialTime;

  const trackProgressRef = useRef(trackProgress);
  trackProgressRef.current = trackProgress;

  const mergeWatchedRanges = useCallback((ranges) => {
    const sorted = ranges
      .filter(
        (range) =>
          Array.isArray(range) &&
          Number.isFinite(Number(range[0])) &&
          Number.isFinite(Number(range[1])) &&
          Number(range[1]) > Number(range[0])
      )
      .map(([start, end]) => [
        Math.max(0, Number(start)),
        Math.max(0, Number(end)),
      ])
      .sort((a, b) => a[0] - b[0]);

    const merged = [];

    for (const range of sorted) {
      const last = merged[merged.length - 1];

      if (last && range[0] <= last[1] + 0.25) {
        last[1] = Math.max(last[1], range[1]);
      } else {
        merged.push([...range]);
      }
    }

    return merged;
  }, []);


  const saveProgress = useCallback(
  (currentTime, duration, force = false) => {
    if (
      !trackProgressRef.current ||
      !Number.isFinite(currentTime) ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }

    const safeTime = Math.min(Math.max(0, currentTime), duration);
    const previous = lastSampleRef.current;

    // Count only normal playback. A seek does not count as watched time.
    if (
      previous !== null &&
      // safeTime > previous &&
      // safeTime - previous <= 2.5
      safeTime > previous &&
safeTime - previous <= 4
    ) {
      watchedRangesRef.current = mergeWatchedRanges([
        ...watchedRangesRef.current,
        [previous, safeTime],
      ]);
    }

    lastSampleRef.current = safeTime;

    const ranges = watchedRangesRef.current;
    const furthestWatched = ranges.reduce(
      (max, range) => Math.max(max, range[1]),
      0
    );

    // Save every 1 second of newly watched video, not every 5 seconds.
    if (force || furthestWatched - lastSavedRef.current >= 1) {
      lastSavedRef.current = furthestWatched;

      callbacksRef.current.onWatchProgress?.({
        currentPositionSeconds: safeTime,
        durationSeconds: duration,
        watchedRanges: ranges,
        completed: false,
      });
    }
  },
  [mergeWatchedRanges]
);
  // const saveProgress = useCallback(
  //   (currentTime, duration, force = false) => {
  //     if (
  //       !trackProgressRef.current ||
  //       !Number.isFinite(currentTime) ||
  //       !Number.isFinite(duration) ||
  //       duration <= 0
  //     ) {
  //       return;
  //     }

  //     const previous = lastSampleRef.current;

  //     // Count only normal playback movement. Seeking does not count.
  //     if (
  //       previous !== null &&
  //       currentTime > previous &&
  //       currentTime - previous <= 2.5
  //     ) {
  //       watchedRangesRef.current = mergeWatchedRanges([
  //         ...watchedRangesRef.current,
  //         [previous, currentTime],
  //       ]);
  //     }

  //     lastSampleRef.current = currentTime;

  //     const ranges = watchedRangesRef.current;
  //     const furthestWatched = ranges.reduce(
  //       (max, range) => Math.max(max, range[1]),
  //       0
  //     );

  //     if (
  //       force ||
  //       furthestWatched - lastSavedRef.current >= 5
  //     ) {
  //       lastSavedRef.current = furthestWatched;

  //       callbacksRef.current.onWatchProgress?.({
  //         currentPositionSeconds: currentTime,
  //         durationSeconds: duration,
  //         watchedRanges: ranges,
  //         completed: false,
  //       });
  //     }
  //   },
  //   [mergeWatchedRanges]
  // );

  // const finishVideo = useCallback(
  //   (duration) => {
  //     if (
  //       !trackProgressRef.current ||
  //       completedRef.current ||
  //       !Number.isFinite(duration) ||
  //       duration <= 0
  //     ) {
  //       return;
  //     }

  //     const ranges = watchedRangesRef.current;

  //     const watchedSeconds = ranges.reduce(
  //       (total, [start, end]) => total + end - start,
  //       0
  //     );

  //     const furthestWatched = ranges.reduce(
  //       (max, range) => Math.max(max, range[1]),
  //       0
  //     );

  //     // Require actual watched intervals, not a direct seek to the end.
  //     if (
  //       watchedSeconds / duration >= 0.9 &&
  //       furthestWatched >= duration * 0.95
  //     ) {
  //       completedRef.current = true;

  //       callbacksRef.current.onWatchProgress?.({
  //         currentPositionSeconds: duration,
  //         durationSeconds: duration,
  //         watchedRanges: ranges,
  //         completed: true,
  //       });

  //       callbacksRef.current.onComplete?.();
  //     }
  //   },
  //   []
  // );


  const finishVideo = useCallback(
  async (duration) => {
    if (
      !trackProgressRef.current ||
      completedRef.current ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }

    const ranges = watchedRangesRef.current;

    const watchedSeconds = ranges.reduce(
      (total, [start, end]) => total + Math.max(0, end - start),
      0
    );

    const furthestWatched = ranges.reduce(
      (max, range) => Math.max(max, range[1]),
      0
    );

    // Each video is checked against its own actual duration.
    if (
      watchedSeconds / duration >= 0.9 &&
      furthestWatched >= duration * 0.95
    ) {
      try {
        // Wait until the backend confirms the completion save.
        await callbacksRef.current.onWatchProgress?.({
          currentPositionSeconds: duration,
          durationSeconds: duration,
          watchedRanges: ranges,
          completed: true,
        });

        completedRef.current = true;
        callbacksRef.current.onComplete?.();
      } catch (error) {
        console.error("Unable to save video completion:", error);
      }
    }
  },
  []
);
  // Reset player tracking when a different lesson is opened.
  useEffect(() => {
    watchedRangesRef.current = mergeWatchedRanges(
      Array.isArray(initialWatchedRanges)
        ? initialWatchedRanges
        : []
    );

    lastSampleRef.current = null;
    lastSavedRef.current = 0;
    completedRef.current = false;

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [src, mergeWatchedRanges]);

  // Uploaded video playback.
  useEffect(() => {
    if (!src || youtubeId) {
      setStarted(false);
      return;
    }

    setStarted(true);

    return () => {
      const video = videoRef.current;

      if (video && trackProgressRef.current) {
        saveProgress(video.currentTime, video.duration, true);
      }
    };
  }, [src, youtubeId, saveProgress]);

  // YouTube playback and progress tracking.
  useEffect(() => {
    if (!youtubeId || !youtubeMountRef.current) return;

    let cancelled = false;
    let player = null;

    const initialize = async () => {
      try {
        const YT = await loadYouTubeAPI();

        if (cancelled || !youtubeMountRef.current) return;

        youtubeMountRef.current.innerHTML = "";

        const mount = document.createElement("div");
        youtubeMountRef.current.appendChild(mount);

        player = new YT.Player(mount, {
          width: "100%",
          height: "100%",
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;

              const duration = event.target.getDuration();

              if (initialTimeRef.current > 0 && duration > 0) {
                event.target.seekTo(
                  Math.min(initialTimeRef.current, duration - 0.5),
                  true
                );
              }
            },

            // onStateChange: (event) => {
              onStateChange: async (event) => {
              if (cancelled) return;

              const currentPlayer = event.target;

              // Playing
              if (event.data === YT.PlayerState.PLAYING) {
                lastSampleRef.current =
                  currentPlayer.getCurrentTime();

                if (saveTimerRef.current) {
                  clearInterval(saveTimerRef.current);
                }

                saveTimerRef.current = setInterval(() => {
                  if (!trackProgressRef.current) return;

                  const currentTime = currentPlayer.getCurrentTime();
                  const duration = currentPlayer.getDuration();

                  saveProgress(currentTime, duration);
                }, 1000);
              }

              // Paused
              if (event.data === YT.PlayerState.PAUSED) {
                if (saveTimerRef.current) {
                  clearInterval(saveTimerRef.current);
                  saveTimerRef.current = null;
                }

                saveProgress(
                  currentPlayer.getCurrentTime(),
                  currentPlayer.getDuration(),
                  true
                );
              }

              // Ended
              // if (event.data === YT.PlayerState.ENDED) {
              //   if (saveTimerRef.current) {
              //     clearInterval(saveTimerRef.current);
              //     saveTimerRef.current = null;
              //   }

              //   const duration = currentPlayer.getDuration();

              //   saveProgress(duration, duration, true);
              //   finishVideo(duration);
              // }
              if (event.data === YT.PlayerState.ENDED) {
  if (saveTimerRef.current) {
    clearInterval(saveTimerRef.current);
    saveTimerRef.current = null;
  }

  const duration = currentPlayer.getDuration();

  saveProgress(duration, duration, true);
  await finishVideo(duration);
}

              // Buffering, seeking or other state changes.
              if (
                event.data === YT.PlayerState.BUFFERING ||
                event.data === YT.PlayerState.CUED
              ) {
                lastSampleRef.current =
                  currentPlayer.getCurrentTime();
              }
            },
          },
        });

        youtubePlayerRef.current = player;
      } catch (error) {
        console.error("YouTube player initialization failed:", error);
      }
    };

    initialize();

    return () => {
      cancelled = true;

      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      try {
        const currentPlayer = youtubePlayerRef.current;

        if (currentPlayer?.getCurrentTime) {
          saveProgress(
            currentPlayer.getCurrentTime(),
            currentPlayer.getDuration(),
            true
          );
        }

        currentPlayer?.destroy();
      } catch {
        // Ignore player cleanup errors.
      }

      youtubePlayerRef.current = null;
    };
  }, [youtubeId, saveProgress, finishVideo]);

  const start = () => {
    setStarted(true);

    setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 30);
  };

  const toggleFullscreen = async () => {
    const element = wrapRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      try {
        await element.requestFullscreen();
        setIsFs(true);
      } catch {
        // Fullscreen may be blocked by the browser.
      }
    } else {
      await document.exitFullscreen();
      setIsFs(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-video w-full overflow-hidden bg-black ${
        className || ""
      }`}
      onDoubleClick={toggleFullscreen}
    >
      {youtubeId ? (
        <div
          ref={youtubeMountRef}
          className="absolute inset-0 h-full w-full"
        />
      ) : !started ? (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            poster &&
            (poster.startsWith("http") ||
              poster.startsWith("data:image"))
              ? ""
              : `bg-gradient-to-br ${
                  poster || "from-slate-800 to-slate-900"
                }`
          }`}
          style={
            poster &&
            (poster.startsWith("http") ||
              poster.startsWith("data:image"))
              ? {
                  backgroundImage: `url(${poster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative text-center text-white">
            <Button
              size="icon"
              onClick={start}
              className="h-16 w-16 rounded-full bg-white/95 text-foreground shadow-xl hover:bg-white"
            >
              <Play className="h-7 w-7" />
            </Button>

            {badge && (
              <Badge className="mt-4 border-0 bg-white/20 text-white">
                {badge}
              </Badge>
            )}

            {title && (
              <p className="mt-2 text-sm font-medium">{title}</p>
            )}

            {subtitle && (
              <p className="text-xs opacity-90">{subtitle}</p>
            )}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          controls
          playsInline
          className="absolute inset-0 h-full w-full bg-black object-contain"
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;

            if (initialTime > 0 && video.duration > 0) {
              video.currentTime = Math.min(
                initialTime,
                Math.max(0, video.duration - 0.5)
              );
            }
          }}
          onPlay={(event) => {
            lastSampleRef.current = event.currentTarget.currentTime;
          }}
          onSeeking={(event) => {
            lastSampleRef.current = event.currentTarget.currentTime;
          }}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            saveProgress(video.currentTime, video.duration);
          }}
          onPause={(event) => {
            const video = event.currentTarget;
            saveProgress(video.currentTime, video.duration, true);
          }}
          // onEnded={(event) => {
          //   const video = event.currentTarget;
          //   saveProgress(video.duration, video.duration, true);
          //   finishVideo(video.duration);
          // }}
          onEnded={async (event) => {
  const video = event.currentTarget;

  saveProgress(video.duration, video.duration, true);
  await finishVideo(video.duration);
}}
        />
      )}

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
      >
        {isFs ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}




// import { useEffect, useRef, useState } from "react";
// import { Play, Maximize2, Minimize2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";


// function getYouTubeVideoId(value) {
//   if (!value?.trim()) return null;

//   try {
//     const url = new URL(
//       value.trim().startsWith("http")
//         ? value.trim()
//         : `https://${value.trim()}`
//     );

//     if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
//       return url.pathname.split("/").filter(Boolean)[0] || null;
//     }

//     if (
//       url.hostname === "youtube.com" ||
//       url.hostname.endsWith(".youtube.com") ||
//       url.hostname === "youtube-nocookie.com" ||
//       url.hostname.endsWith(".youtube-nocookie.com")
//     ) {
//       const fromQuery = url.searchParams.get("v");
//       if (fromQuery) return fromQuery;

//       const parts = url.pathname.split("/").filter(Boolean);

//       if (["embed", "shorts", "live", "v"].includes(parts[0])) {
//         return parts[1] || null;
//       }
//     }
//   } catch {
//     return null;
//   }

//   return null;
// }


//   export default function VideoPlayer({
//   src,
//   poster,
//   title,
//   subtitle,
//   badge,
//   className,
//   initialTime = 0,
//   initialWatchedRanges = [],
//   trackProgress = false,
//   onWatchProgress,
//   onComplete,
// }) {
//   const wrapRef = useRef(null);
//   const videoRef = useRef(null);

//   const [started, setStarted] = useState(false);
//   const [isFs, setIsFs] = useState(false);

//   const youtubeId = getYouTubeVideoId(src);

//   // useEffect(() => {
//   //   if (!src) return;
//   //   setStarted(true);
//   //   setTimeout(() => {
//   //     const v = videoRef.current;
//   //     if (v) v.play().catch(() => {});
//   //   }, 30);
//   // }, [src]);

//   const watchedRangesRef = useRef([]);
// const lastSampleRef = useRef(null);
// const lastSavedPositionRef = useRef(0);
// const completedRef = useRef(false);
// const playerTimerRef = useRef(null);
// const youtubePlayerRef = useRef(null);
// const youtubeIframeRef = useRef(null);

// useEffect(() => {
//   watchedRangesRef.current = Array.isArray(initialWatchedRanges)
//     ? initialWatchedRanges
//     : [];

//   lastSampleRef.current = null;
//   lastSavedPositionRef.current = 0;
//   completedRef.current = false;
// }, [src, initialWatchedRanges]);

// const mergeWatchedRanges = (ranges) => {
//   const sorted = ranges
//     .filter(
//       (range) =>
//         Array.isArray(range) &&
//         Number.isFinite(range[0]) &&
//         Number.isFinite(range[1]) &&
//         range[1] > range[0]
//     )
//     .map(([start, end]) => [Math.max(0, start), Math.max(0, end)])
//     .sort((a, b) => a[0] - b[0]);

//   const merged = [];

//   for (const range of sorted) {
//     const last = merged[merged.length - 1];

//     if (last && range[0] <= last[1] + 0.25) {
//       last[1] = Math.max(last[1], range[1]);
//     } else {
//       merged.push([...range]);
//     }
//   }

//   return merged;
// };

// const getWatchedSeconds = (ranges) =>
//   ranges.reduce((total, [start, end]) => total + end - start, 0);

// const recordVideoSample = (currentTime, duration, forceSave = false) => {
//   if (!trackProgress || !Number.isFinite(currentTime)) return;

//   const previousTime = lastSampleRef.current;

//   // Only count normal playback movement. A large jump is treated as seeking.
//   if (
//     previousTime !== null &&
//     currentTime > previousTime &&
//     currentTime - previousTime <= 3
//   ) {
//     watchedRangesRef.current = mergeWatchedRanges([
//       ...watchedRangesRef.current,
//       [previousTime, currentTime],
//     ]);
//   }

//   lastSampleRef.current = currentTime;

//   const ranges = watchedRangesRef.current;
//   const furthestWatched = ranges.reduce(
//     (furthest, range) => Math.max(furthest, range[1]),
//     0
//   );

//   if (
//     forceSave ||
//     furthestWatched - lastSavedPositionRef.current >= 5
//   ) {
//     lastSavedPositionRef.current = furthestWatched;

//     onWatchProgress?.({
//       currentPositionSeconds: furthestWatched,
//       durationSeconds: duration || 0,
//       watchedRanges: ranges,
//       completed: false,
//     });
//   }
// };

// const finishVideo = (duration) => {
//   if (!trackProgress || completedRef.current || !duration) return;

//   const ranges = watchedRangesRef.current;
//   const watchedSeconds = getWatchedSeconds(ranges);
//   const furthestWatched = ranges.reduce(
//     (furthest, range) => Math.max(furthest, range[1]),
//     0
//   );

//   // Prevent a direct seek to the end from completing a video.
//   if (
//     watchedSeconds / duration >= 0.9 &&
//     furthestWatched >= duration * 0.95
//   ) {
//     completedRef.current = true;

//     onWatchProgress?.({
//       currentPositionSeconds: furthestWatched,
//       durationSeconds: duration,
//       watchedRanges: ranges,
//       completed: true,
//     });

//     onComplete?.();
//   }
// };

//   useEffect(() => {
//   if (!src || youtubeId) {
//     setStarted(false);
//     return;
//   }

//   setStarted(true);

//   const timer = setTimeout(() => {
//     const video = videoRef.current;

//     if (video) {
//       video.play().catch(() => {});
//     }
//   }, 30);

//   return () => clearTimeout(timer);
// }, [src, youtubeId]);

//   const start = () => {
//     setStarted(true);

//     // wait for video mount
//     setTimeout(() => {
//       const v = videoRef.current;
//       if (v) v.play().catch(() => {});
//     }, 30);
//   };

//   const toggleFullscreen = async () => {
//     const el = wrapRef.current;
//     if (!el) return;

//     if (!document.fullscreenElement) {
//       try {
//         await el.requestFullscreen();
//         setIsFs(true);
//       } catch {}
//     } else {
//       await document.exitFullscreen();
//       setIsFs(false);
//     }
//   };

//   return (
//     <div
//       ref={wrapRef}
//       className={`relative aspect-video w-full overflow-hidden bg-black ${
//         className || ""
//       }`}
//       onDoubleClick={toggleFullscreen}
//     >
//       {youtubeId ? (
//   <iframe
//     key={youtubeId}
//     src={`https://www.youtube-nocookie.com/embed/${youtubeId}?playsinline=1&rel=0`}
//     title={title || "Class video"}
//     className="absolute inset-0 h-full w-full border-0 bg-black"
//     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//     referrerPolicy="strict-origin-when-cross-origin"
//     allowFullScreen
//   />
// ) : !started ? (
//   <div
//     className={`absolute inset-0 flex items-center justify-center ${
//       poster &&
//       (poster.startsWith("http") || poster.startsWith("data:image"))
//         ? ""
//         : `bg-gradient-to-br ${poster || "from-slate-800 to-slate-900"}`
//     }`}
//     style={
//       poster &&
//       (poster.startsWith("http") || poster.startsWith("data:image"))
//         ? {
//             backgroundImage: `url(${poster})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//           }
//         : undefined
//     }
//   >
//     <div className="absolute inset-0 bg-black/40" />

//     <div className="relative text-center text-white">
//       <Button
//         size="icon"
//         onClick={start}
//         className="h-16 w-16 rounded-full bg-white/95 text-foreground shadow-xl hover:bg-white"
//       >
//         <Play className="h-7 w-7" />
//       </Button>

//       {badge && (
//         <Badge className="mt-4 border-0 bg-white/20 text-white">
//           {badge}
//         </Badge>
//       )}

//       {title && (
//         <p className="mt-2 text-sm font-medium">{title}</p>
//       )}

//       {subtitle && (
//         <p className="text-xs opacity-90">{subtitle}</p>
//       )}
//     </div>
//   </div>
// ) : (
  
//   <video
//   ref={videoRef}
//   src={src}
//   controls
//   playsInline
//   className="absolute inset-0 h-full w-full bg-black object-contain"
//   onLoadedMetadata={(e) => {
//     if (initialTime > 0) {
//       e.currentTarget.currentTime = Math.min(
//         initialTime,
//         Math.max(0, e.currentTarget.duration - 0.5)
//       );
//     }
//   }}
//   onPlay={(e) => {
//     lastSampleRef.current = e.currentTarget.currentTime;
//   }}
//   onSeeking={(e) => {
//     // Seeking itself must not count as watched time.
//     lastSampleRef.current = e.currentTarget.currentTime;
//   }}
//   onTimeUpdate={(e) => {
//     const video = e.currentTarget;

//     recordVideoSample(video.currentTime, video.duration);
//   }}
//   onPause={(e) => {
//     const video = e.currentTarget;

//     recordVideoSample(video.currentTime, video.duration, true);
//   }}
//   onEnded={(e) => {
//     const video = e.currentTarget;

//     recordVideoSample(video.currentTime, video.duration, true);
//     finishVideo(video.duration);
//   }}
// />
// )}

//       {/* Fullscreen button */}
//       <button
//         type="button"
//         onClick={toggleFullscreen}
//         className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
//       >
//         {isFs ? (
//           <Minimize2 className="h-4 w-4" />
//         ) : (
//           <Maximize2 className="h-4 w-4" />
//         )}
//       </button>
//     </div>
//   );
// }









// import { useEffect, useRef, useState } from "react";
// import { Play, Maximize2, Minimize2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// export default function VideoPlayer({
//   src,
//   poster,
//   title,
//   subtitle,
//   badge,
//   className,
// }) {
//   const wrapRef = useRef(null);
//   const videoRef = useRef(null);

//   const [started, setStarted] = useState(false);
//   const [isFs, setIsFs] = useState(false);

//   useEffect(() => {
//     if (!src) return;
//     setStarted(true);
//     setTimeout(() => {
//       const v = videoRef.current;
//       if (v) v.play().catch(() => {});
//     }, 30);
//   }, [src]);

//   const start = () => {
//     setStarted(true);

//     // wait for video mount
//     setTimeout(() => {
//       const v = videoRef.current;
//       if (v) v.play().catch(() => {});
//     }, 30);
//   };

//   const toggleFullscreen = async () => {
//     const el = wrapRef.current;
//     if (!el) return;

//     if (!document.fullscreenElement) {
//       try {
//         await el.requestFullscreen();
//         setIsFs(true);
//       } catch {}
//     } else {
//       await document.exitFullscreen();
//       setIsFs(false);
//     }
//   };

//   return (
//     <div
//       ref={wrapRef}
//       className={`relative aspect-video w-full overflow-hidden bg-black ${
//         className || ""
//       }`}
//       onDoubleClick={toggleFullscreen}
//     >
//       {!started ? (
//         <div
//           className={`absolute inset-0 flex items-center justify-center ${
//             poster && (poster.startsWith("http") || poster.startsWith("data:image"))
//               ? ""
//               : `bg-gradient-to-br ${poster || "from-slate-800 to-slate-900"}`
//           }`}
//           style={
//             poster && (poster.startsWith("http") || poster.startsWith("data:image"))
//               ? {
//                   backgroundImage: `url(${poster})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }
//               : undefined
//           }
//         >
//           <div className="absolute inset-0 bg-black/40" />

//           <div className="relative text-center text-white">
//             <Button
//               size="icon"
//               onClick={start}
//               className="h-16 w-16 rounded-full bg-white/95 text-foreground shadow-xl hover:bg-white"
//             >
//               <Play className="h-7 w-7" />
//             </Button>

//             {badge && (
//               <Badge className="mt-4 border-0 bg-white/20 text-white">
//                 {badge}
//               </Badge>
//             )}

//             {title && (
//               <p className="mt-2 text-sm font-medium">{title}</p>
//             )}

//             {subtitle && (
//               <p className="text-xs opacity-90">{subtitle}</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <video
//           ref={videoRef}
//           src={src}
//           controls
//           playsInline
//           className="absolute inset-0 h-full w-full bg-black object-contain"
//         />
//       )}

//       {/* Fullscreen button */}
//       <button
//         type="button"
//         onClick={toggleFullscreen}
//         className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
//       >
//         {isFs ? (
//           <Minimize2 className="h-4 w-4" />
//         ) : (
//           <Maximize2 className="h-4 w-4" />
//         )}
//       </button>
//     </div>
//   );
// }