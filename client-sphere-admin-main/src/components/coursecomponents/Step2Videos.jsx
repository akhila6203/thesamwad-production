import { useState, useEffect, useRef } from "react";
import { uploadService } from "@/services/uploadService";

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getYouTubeVideoId(value) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(
      value.trim().startsWith("http")
        ? value.trim()
        : `https://${value.trim()}`
    );

    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (
      url.hostname === "youtube.com" ||
      url.hostname.endsWith(".youtube.com") ||
      url.hostname === "youtube-nocookie.com" ||
      url.hostname.endsWith(".youtube-nocookie.com")
    ) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return fromQuery;

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

function readVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve(formatDuration(video.duration));
      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      resolve("");
      URL.revokeObjectURL(objectUrl);
    };

    video.src = objectUrl;
  });
}

function loadYouTubeIframeAPI() {
  return new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") {
        previousCallback();
      }
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

function formatUploadTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Step2({ onNext, data, setStep, isModal = false, isEdit = false }) {
  const [form, setForm] = useState({
    title: "",
    url: "",
    duration: "",
    uploadedAt: "",
  });

  const youtubeDurationRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // useEffect(() => {
  //   const existing = data?.videos || [];
  //   if (isEdit && existing[0]) {
  //     const v = existing[0];
  //     setForm({
  //       title: v.title || "",
  //       url: v.url || "",
  //       duration: v.duration || "",
  //       uploadedAt: v.uploadedAt || v.createdAt || "",
  //     });
  //     setVideos([]);
  //   } else {
  //     setForm({ title: "", url: "", duration: "", uploadedAt: "" });
  //     setVideos(isEdit ? [] : existing);
  //   }
  // }, [data, isEdit]);
  useEffect(() => {
  const existing = data?.videos || [];

  if (isEdit) {
    setVideos(
      existing.map((v) => ({
        ...v,
        id: v.id ?? v.databaseVideoId ?? v.database_video_id ?? null,
      }))
    );

    setForm({
      title: "",
      url: "",
      duration: "",
      uploadedAt: "",
    });
  } else {
    setForm({
      title: "",
      url: "",
      duration: "",
      uploadedAt: "",
    });

    setVideos(existing);
  }
}, [data, isEdit]);

  useEffect(() => {
  const videoId = getYouTubeVideoId(form.url);

  if (!videoId || !youtubeDurationRef.current) return;

  let cancelled = false;
  let player = null;
  let durationPoll = null;

  loadYouTubeIframeAPI()
    .then((YT) => {
      if (cancelled || !youtubeDurationRef.current) return;

      const mount = document.createElement("div");
      youtubeDurationRef.current.replaceChildren(mount);

      player = new YT.Player(mount, {
        width: "1",
        height: "1",
        videoId,
        playerVars: {
          controls: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            const updateDuration = () => {
              const duration = formatDuration(
                event.target.getDuration()
              );

              if (duration && !cancelled) {
                setForm((previous) =>
                  getYouTubeVideoId(previous.url) === videoId
                    ? { ...previous, duration }
                    : previous
                );

                if (durationPoll) {
                  clearInterval(durationPoll);
                  durationPoll = null;
                }
              }
            };

            if (!cancelled) {
              durationPoll = setInterval(updateDuration, 500);
            }

            updateDuration();
            // updateDuration();

            // if (!cancelled) {
            //   durationPoll = setInterval(updateDuration, 500);
            // }
          },
        },
      });
    })
    .catch(() => {
      // Keep the duration field editable if YouTube metadata is unavailable.
    });

  return () => {
    cancelled = true;

    if (durationPoll) clearInterval(durationPoll);

    try {
      player?.destroy();
    } catch {
      // Ignore cleanup errors.
    }

    if (youtubeDurationRef.current) {
      youtubeDurationRef.current.replaceChildren();
    }
  };
}, [form.url]);

  // const uploadFile = async (file) => {
  //   if (!file) return;
  //   setUploading(true);
  //   try {
  //     const res = await uploadService.video(file);
  //     setForm((prev) => ({
  //       ...prev,
  //       url: res.data.url,
  //       uploadedAt: res.data.uploadedAt,
  //     }));
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Video upload failed");
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  const uploadFile = async (file) => {
  if (!file) return;

  setUploading(true);

  try {
    const duration = await readVideoDuration(file);
    const res = await uploadService.video(file);

    setForm((previous) => ({
      ...previous,
      url: res.data.url,
      duration: duration || previous.duration,
      uploadedAt: res.data.uploadedAt,
    }));
  } catch (err) {
    alert(err.response?.data?.message || "Video upload failed");
  } finally {
    setUploading(false);
  }
};

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
  };

  const addCurrentVideo = () => {
    if (!form.title?.trim()) {
      alert("Video title is required");
      return;
    }
    if (!form.url?.trim()) {
      alert("Video URL or upload is required");
      return;
    }
    setVideos((prev) => [
      ...prev,
      {
        title: form.title.trim(),
        url: form.url.trim(),
        duration: form.duration || "",
        uploadedAt: form.uploadedAt || new Date().toISOString(),
      },
    ]);
    setForm({ title: "", url: "", duration: "", uploadedAt: "" });
  };

  // const buildVideoFromForm = () => ({
  //   title: form.title.trim(),
  //   url: form.url.trim(),
  //   duration: form.duration || "",
  //   uploadedAt: form.uploadedAt || new Date().toISOString(),
  // });
    const buildVideoFromForm = () => ({
    id: data?.videos?.[0]?.id ?? null,
    title: form.title.trim(),
    url: form.url.trim(),
    duration: form.duration || "",
    uploadedAt: form.uploadedAt || new Date().toISOString(),
  });

  // const collectVideos = () => {
  //   if (isEdit) {
  //     if (form.title?.trim() && form.url?.trim()) return [buildVideoFromForm()];
  //     return data?.videos || [];
  //   }
  //   if (videos.length > 0) return videos;
  //   if (form.title?.trim() && form.url?.trim()) return [buildVideoFromForm()];
  //   return data?.videos || [];
  // };
  const collectVideos = () => {
  const currentVideo =
    form.title?.trim() && form.url?.trim()
      ? {
          id: null,
          title: form.title.trim(),
          url: form.url.trim(),
          duration: form.duration || "",
          uploadedAt: form.uploadedAt || new Date().toISOString(),
        }
      : null;

  if (isEdit) {
    return currentVideo ? [...videos, currentVideo] : videos;
  }

  if (videos.length > 0) {
    return currentVideo ? [...videos, currentVideo] : videos;
  }

  return currentVideo ? [currentVideo] : data?.videos || [];
};

  const goNext = () => onNext({ videos: collectVideos() });

  return (
    // <div className="max-w-4xl mx-auto">
    <div className="mx-auto w-full min-w-0 max-w-4xl">
      {!isModal && (
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Add video</h1>
          <p className="text-gray-500 text-sm">
            Enter title & URL, or upload a file (saved on server with upload time).
          </p>
        </div>
      )}

      {/* <div className={`space-y-4 ${isModal ? "" : "bg-white rounded-2xl shadow p-6"}`}> */}
      <div className={`min-w-0 space-y-4 ${isModal ? "" : "rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-5 lg:p-6"}`}>
        <div>
          <label className="text-sm font-medium">Video title</label>
          <input
            value={form.title}
            // onChange={(e) => setForm({ ...form, title: e.target.value })}
onChange={(e) =>
  setForm((previous) => ({
    ...previous,
    title: e.target.value,
  }))
}
            placeholder="e.g. Introduction to Hooks"
            className="mt-1 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500 sm:px-4"
            // className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Video URL</label>
          <input
            value={form.url}
            // onChange={(e) =>
            //   setForm({
            //     ...form,
            //     url: e.target.value,
            //     uploadedAt: form.uploadedAt || new Date().toISOString(),
            //   })
            // }
onChange={(e) =>
  setForm((previous) => ({
    ...previous,
    url: e.target.value,
    duration: getYouTubeVideoId(e.target.value) ? "" : previous.duration,
    uploadedAt:
      previous.uploadedAt || new Date().toISOString(),
  }))
}
            placeholder="https://... or upload below"
            className="w-full mt-1 border rounded-lg px-4 py-2"
          />
        </div>

        <div
  ref={youtubeDurationRef}
  aria-hidden="true"
  className="fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0 pointer-events-none"
/>

        <div>
          <label className="text-sm font-medium">Duration</label>
          <input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g. 12:30"
            className="w-full mt-1 border rounded-lg px-4 py-2"
          />
        </div>

        {form.uploadedAt && (
          <p className="text-xs text-green-700">
            Uploaded: {formatUploadTime(form.uploadedAt)}
          </p>
        )}

        {!isEdit && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addCurrentVideo}
              disabled={uploading}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              + Add video to list
            </button>
          </div>
        )}

        {!isEdit && videos.length > 0 && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Added videos ({videos.length})</p>
            {videos.map((v, idx) => (
              <div
                key={idx}
                className="flex min-w-0 flex-col gap-2 border-b pb-3 text-sm last:border-0 sm:flex-row sm:items-start sm:justify-between"
                // className="flex items-start justify-between gap-2 text-sm border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{v.title}</p>
                  <p className="text-gray-500 truncate max-w-md">{v.url}</p>
                  {v.duration && (
                    <p className="text-gray-400 text-xs">Duration: {v.duration}</p>
                  )}
                  {v.uploadedAt && (
                    <p className="text-gray-400 text-xs">
                      {formatUploadTime(v.uploadedAt)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="text-red-500 shrink-0"
                  onClick={() =>
                    setVideos((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">Upload video</label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-5 text-center transition sm:p-8
           
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              ${uploading ? "opacity-60 pointer-events-none" : "cursor-pointer"}
            `}
          >
            <input
              type="file"
              accept="video/*"
              onChange={(e) => uploadFile(e.target.files[0])}
              className="hidden"
              id="videoUpload"
              disabled={uploading}
            />
            <label htmlFor="videoUpload" className="cursor-pointer block">
              <div className="text-gray-500">
                {uploading ? "Uploading..." : "Click or drag video here"}
              </div>
            </label>
          </div>
        </div>

        {/* <div className="flex justify-end gap-3 pt-4"> */}
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
          {isModal ? (
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              {isEdit ? "Update" : "Add"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2 border rounded-lg"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save & Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}






// import { useState, useEffect } from "react";
// import { uploadService } from "@/services/uploadService";

// function formatUploadTime(iso) {
//   if (!iso) return "";
//   try {
//     return new Date(iso).toLocaleString();
//   } catch {
//     return iso;
//   }
// }

// export default function Step2({ onNext, data, setStep, isModal = false, isEdit = false }) {
//   const [form, setForm] = useState({
//     title: "",
//     url: "",
//     duration: "",
//     uploadedAt: "",
//   });

//   const [dragActive, setDragActive] = useState(false);
//   const [videos, setVideos] = useState([]);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     const existing = data?.videos || [];
//     if (isEdit && existing[0]) {
//       const v = existing[0];
//       setForm({
//         title: v.title || "",
//         url: v.url || "",
//         duration: v.duration || "",
//         uploadedAt: v.uploadedAt || v.createdAt || "",
//       });
//       setVideos([]);
//     } else {
//       setForm({ title: "", url: "", duration: "", uploadedAt: "" });
//       setVideos(isEdit ? [] : existing);
//     }
//   }, [data, isEdit]);

//   const uploadFile = async (file) => {
//     if (!file) return;
//     setUploading(true);
//     try {
//       const res = await uploadService.video(file);
//       setForm((prev) => ({
//         ...prev,
//         url: res.data.url,
//         uploadedAt: res.data.uploadedAt,
//       }));
//     } catch (err) {
//       alert(err.response?.data?.message || "Video upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragActive(false);
//     if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
//   };

//   const addCurrentVideo = () => {
//     if (!form.title?.trim()) {
//       alert("Video title is required");
//       return;
//     }
//     if (!form.url?.trim()) {
//       alert("Video URL or upload is required");
//       return;
//     }
//     setVideos((prev) => [
//       ...prev,
//       {
//         title: form.title.trim(),
//         url: form.url.trim(),
//         duration: form.duration || "",
//         uploadedAt: form.uploadedAt || new Date().toISOString(),
//       },
//     ]);
//     setForm({ title: "", url: "", duration: "", uploadedAt: "" });
//   };

//   const buildVideoFromForm = () => ({
//     title: form.title.trim(),
//     url: form.url.trim(),
//     duration: form.duration || "",
//     uploadedAt: form.uploadedAt || new Date().toISOString(),
//   });

//   const collectVideos = () => {
//     if (isEdit) {
//       if (form.title?.trim() && form.url?.trim()) return [buildVideoFromForm()];
//       return data?.videos || [];
//     }
//     if (videos.length > 0) return videos;
//     if (form.title?.trim() && form.url?.trim()) return [buildVideoFromForm()];
//     return data?.videos || [];
//   };

//   const goNext = () => onNext({ videos: collectVideos() });

//   return (
//     <div className="max-w-4xl mx-auto">
//       {!isModal && (
//         <div className="mb-6">
//           <h1 className="text-xl font-semibold">Add video</h1>
//           <p className="text-gray-500 text-sm">
//             Enter title & URL, or upload a file (saved on server with upload time).
//           </p>
//         </div>
//       )}

//       <div className={`space-y-4 ${isModal ? "" : "bg-white rounded-2xl shadow p-6"}`}>
//         <div>
//           <label className="text-sm font-medium">Video title</label>
//           <input
//             value={form.title}
//             onChange={(e) => setForm({ ...form, title: e.target.value })}
//             placeholder="e.g. Introduction to Hooks"
//             className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium">Video URL</label>
//           <input
//             value={form.url}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 url: e.target.value,
//                 uploadedAt: form.uploadedAt || new Date().toISOString(),
//               })
//             }
//             placeholder="https://... or upload below"
//             className="w-full mt-1 border rounded-lg px-4 py-2"
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium">Duration</label>
//           <input
//             value={form.duration}
//             onChange={(e) => setForm({ ...form, duration: e.target.value })}
//             placeholder="e.g. 12:30"
//             className="w-full mt-1 border rounded-lg px-4 py-2"
//           />
//         </div>

//         {form.uploadedAt && (
//           <p className="text-xs text-green-700">
//             Uploaded: {formatUploadTime(form.uploadedAt)}
//           </p>
//         )}

//         {!isEdit && (
//           <div className="flex justify-end">
//             <button
//               type="button"
//               onClick={addCurrentVideo}
//               disabled={uploading}
//               className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
//             >
//               + Add video to list
//             </button>
//           </div>
//         )}

//         {!isEdit && videos.length > 0 && (
//           <div className="space-y-2 rounded-lg border p-3">
//             <p className="text-sm font-medium">Added videos ({videos.length})</p>
//             {videos.map((v, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-start justify-between gap-2 text-sm border-b pb-2 last:border-0"
//               >
//                 <div>
//                   <p className="font-medium">{v.title}</p>
//                   <p className="text-gray-500 truncate max-w-md">{v.url}</p>
//                   {v.duration && (
//                     <p className="text-gray-400 text-xs">Duration: {v.duration}</p>
//                   )}
//                   {v.uploadedAt && (
//                     <p className="text-gray-400 text-xs">
//                       {formatUploadTime(v.uploadedAt)}
//                     </p>
//                   )}
//                 </div>
//                 <button
//                   type="button"
//                   className="text-red-500 shrink-0"
//                   onClick={() =>
//                     setVideos((prev) => prev.filter((_, i) => i !== idx))
//                   }
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         <div>
//           <label className="text-sm font-medium mb-2 block">Upload video</label>
//           <div
//             onDragOver={(e) => {
//               e.preventDefault();
//               setDragActive(true);
//             }}
//             onDragLeave={() => setDragActive(false)}
//             onDrop={handleDrop}
//             className={`border-2 border-dashed rounded-xl p-8 text-center transition
//               ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
//               ${uploading ? "opacity-60 pointer-events-none" : "cursor-pointer"}
//             `}
//           >
//             <input
//               type="file"
//               accept="video/*"
//               onChange={(e) => uploadFile(e.target.files[0])}
//               className="hidden"
//               id="videoUpload"
//               disabled={uploading}
//             />
//             <label htmlFor="videoUpload" className="cursor-pointer block">
//               <div className="text-gray-500">
//                 {uploading ? "Uploading..." : "Click or drag video here"}
//               </div>
//             </label>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 pt-4">
//           {isModal ? (
//             <button
//               type="button"
//               onClick={goNext}
//               className="px-6 py-2 bg-purple-600 text-white rounded-lg"
//             >
//               {isEdit ? "Update" : "Add"}
//             </button>
//           ) : (
//             <>
//               <button
//                 type="button"
//                 onClick={() => setStep((prev) => prev - 1)}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Previous
//               </button>
//               <button
//                 type="button"
//                 onClick={goNext}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg"
//               >
//                 Save & Next
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
