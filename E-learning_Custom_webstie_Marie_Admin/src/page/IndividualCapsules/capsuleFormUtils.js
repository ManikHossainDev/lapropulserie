/** Resolve MongoDB / populated id fields to a plain string id. */
export function resolveId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.id) return value.id;
  return '';
}

/** True for YouTube / Vimeo links that belong in the Embed field. */
export function isExternalEmbedUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com/i.test(url);
}

/** Normalize video values returned by the API (string URL or video object). */
export function resolveVideoSource(video) {
  if (!video) return { embed: '', existing: null };
  if (typeof video === 'string') {
    // Only put YouTube/Vimeo into Embed input — S3/MP4 stays as "existing upload"
    if (isExternalEmbedUrl(video)) return { embed: video, existing: null };
    return { embed: '', existing: { url: video, status: 'ready' } };
  }
  if (typeof video === 'object') {
    if (video.url && isExternalEmbedUrl(video.url)) {
      return { embed: video.url, existing: null };
    }
    if (video.url) return { embed: '', existing: video };
    return { embed: '', existing: video };
  }
  return { embed: '', existing: null };
}

/** Normalize YouTube/Vimeo paste: raw URL, /embed/ URL, or full <iframe> HTML. */
export function normalizeEmbedVideoInput(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const value = raw.trim();
  if (!value) return '';

  const iframeSrc = value.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeSrc?.[1]) return iframeSrc[1].trim();

  const ytWatch = value.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/i,
  );
  if (ytWatch?.[1]) {
    return `https://www.youtube.com/embed/${ytWatch[1]}`;
  }

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo?.[1]) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  if (/^https?:\/\//i.test(value)) return value;
  return value;
}

function resolveVideoPayload(embedValue, fileState, existingVideo) {
  const trimmed = normalizeEmbedVideoInput(
    typeof embedValue === 'string' ? embedValue : '',
  );
  if (trimmed) {
    // Embed field wins — YouTube/Vimeo (or any explicit paste) replaces prior upload
    return { url: trimmed, status: 'ready' };
  }

  const existingPayload = (() => {
    if (!existingVideo || typeof existingVideo !== 'object') return undefined;
    // Don't keep stuck processing placeholders without a URL
    if (existingVideo.status === 'processing' && !existingVideo.url) {
      return undefined;
    }
    if (existingVideo.url) {
      const cleanedUrl = normalizeEmbedVideoInput(existingVideo.url) || existingVideo.url;
      return {
        url: cleanedUrl,
        status: existingVideo.status || 'ready',
        ...(existingVideo.duration != null ? { duration: existingVideo.duration } : {}),
      };
    }
    return existingVideo;
  })();

  // New file is sent as multipart; backend prefers it over nested JSON.
  // Still include existing as fallback so a dropped file part does not wipe the video.
  if (fileState?.file) {
    return existingPayload;
  }

  return existingPayload;
}

function buildPartVideoField(embedValue, fileState, existingVideo) {
  const video = resolveVideoPayload(embedValue, fileState, existingVideo);
  // Always return a key: object = keep/set, null = explicit clear, undefined omitted only if never called
  return { video: video ?? null };
}

export function buildCapsulePayload({
  title,
  capsuleCategoryId,
  introTitle,
  introText,
  founderVideoEmbed,
  founderVideoFile,
  existingFounderVideo,
  inspTitle,
  inspText,
  inspirationVideoEmbed,
  inspirationVideoFile,
  existingInspirationVideo,
  reflTitle,
  reflInstructions,
  questions,
  practTitle,
  exercises,
  sciTitle,
  sciText,
  sciVideoEmbed,
  sciVideoFile,
  existingScienceVideo,
}) {
  const founderVideo = buildPartVideoField(
    founderVideoEmbed,
    founderVideoFile,
    existingFounderVideo,
  );
  const inspirationVideo = buildPartVideoField(
    inspirationVideoEmbed,
    inspirationVideoFile,
    existingInspirationVideo,
  );
  const optionalVideo = buildPartVideoField(
    sciVideoEmbed,
    sciVideoFile,
    existingScienceVideo,
  );

  return {
    title: title.trim(),
    capsuleCategoryId: resolveId(capsuleCategoryId),
    introduction: {
      title: introTitle,
      text: introText,
      founderVideo: founderVideo.video,
    },
    inspiration: {
      title: inspTitle,
      text: inspText,
      inspirationVideo: inspirationVideo.video,
    },
    reflection: {
      title: reflTitle,
      instructions: reflInstructions,
      questions: questions
        .filter((q) => q.question.trim() !== '')
        .map((q, index) => ({
          question: q.question.trim(),
          orderNumber: index + 1,
        })),
    },
    practicalExercises: {
      title: practTitle,
      exercises: exercises
        .filter((ex) => ex.exercise.trim() !== '')
        .map((ex, index) => ({
          exercise: ex.exercise.trim(),
          orderNumber: index + 1,
        })),
    },
    science: {
      title: sciTitle,
      text: sciText,
      optionalVideo: optionalVideo.video,
    },
  };
}

export function appendCapsuleFiles(formData, files) {
  const { founderVideoFile, inspirationVideoFile, sciVideoFile } = files;
  if (founderVideoFile?.file) formData.append('founderVideo', founderVideoFile.file);
  if (inspirationVideoFile?.file) formData.append('inspirationVideo', inspirationVideoFile.file);
  if (sciVideoFile?.file) formData.append('scienceVideo', sciVideoFile.file);
}

export const MAX_VIDEO_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 MB per video file

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export function validateCapsuleVideoFiles({
  founderVideoFile,
  inspirationVideoFile,
  sciVideoFile,
}) {
  const errors = [];
  const entries = [
    { label: 'Founder video (Part 1)', file: founderVideoFile?.file },
    { label: 'Inspiration video (Part 2)', file: inspirationVideoFile?.file },
    { label: 'Science video (Part 5)', file: sciVideoFile?.file },
  ];

  for (const { label, file } of entries) {
    if (file && file.size > MAX_VIDEO_UPLOAD_BYTES) {
      errors.push(
        `${label} is ${formatFileSize(file.size)}. Max upload is 250 MB per video — use "Embed Link" for larger files (YouTube/Vimeo URL).`,
      );
    }
  }

  return errors;
}

/** Prefer API message; surface proxy/size failures when RTK has no JSON body. */
export function getCapsuleUpdateErrorMessage(error) {
  const apiMessage =
    error?.data?.message ||
    error?.data?.errorMessages?.map((item) => item?.message).filter(Boolean).join(', ');

  if (apiMessage) return apiMessage;

  const status = error?.status;
  if (status === 413) {
    return 'Upload rejected: file is too large for the server (HTTP 413). Max is 250 MB per video, and nginx on the API host must allow client_max_body_size 250m.';
  }
  if (status === 'FETCH_ERROR' || status === 'PARSING_ERROR' || status === 'TIMEOUT_ERROR') {
    return 'Upload failed before a response was received (network reset, timeout, or proxy limit). Try a smaller file, wait for a stable connection, or ask ops to raise nginx client_max_body_size / proxy timeouts on the API host.';
  }
  if (typeof status === 'number' && status >= 500) {
    return 'Server error while uploading the video. The API may have run out of memory — retry after the latest backend deploy (disk-based uploads).';
  }

  return 'Failed to update capsule. Please try again.';
}

export function validateCapsuleForm({ categoryId, isEdit, title }) {
  const errors = [];

  if (!isEdit && !categoryId) {
    errors.push('Category is missing. Please create the capsule from a category page.');
  }
  if (isEdit && !categoryId) {
    errors.push('Capsule category reference is missing. Please reload the page.');
  }
  if (!title?.trim()) errors.push('Capsule title is required.');

  return errors;
}

/** Stable key so edit forms re-hydrate after save/refetch, not on every render. */
export function getCapsuleHydrationKey(capsule) {
  if (!capsule?.id) return null;
  return `${capsule.id}:${capsule.updatedAt ?? ''}`;
}

/** Map GET /individual-capsule/:id response into edit-form default values. */
export function mapCapsuleApiToFormState(capsule) {
  if (!capsule?.id) return null;

  const founder = resolveVideoSource(capsule.introduction?.founderVideo);
  const inspiration = resolveVideoSource(capsule.inspiration?.inspirationVideo);
  const science = resolveVideoSource(capsule.science?.optionalVideo);

  return {
    capsuleCategoryId: resolveId(capsule.capsuleCategoryId),
    title: capsule.title ?? '',
    introTitle: capsule.introduction?.title ?? '',
    introText: capsule.introduction?.text ?? '',
    founderVideoEmbed: founder.embed,
    existingFounderVideo: founder.existing,
    inspTitle: capsule.inspiration?.title ?? '',
    inspText: capsule.inspiration?.text ?? '',
    inspirationVideoEmbed: inspiration.embed,
    existingInspirationVideo: inspiration.existing,
    reflTitle: capsule.reflection?.title ?? '',
    reflInstructions: capsule.reflection?.instructions ?? '',
    questions:
      capsule.reflection?.questions?.length > 0
        ? capsule.reflection.questions.map((q, index) => ({
            question: q.question ?? '',
            orderNumber: q.orderNumber ?? index + 1,
          }))
        : [{ question: '', orderNumber: 1 }],
    practTitle: capsule.practicalExercises?.title ?? '',
    exercises:
      capsule.practicalExercises?.exercises?.length > 0
        ? capsule.practicalExercises.exercises.map((ex, index) => ({
            exercise: ex.exercise ?? '',
            orderNumber: ex.orderNumber ?? index + 1,
          }))
        : [{ exercise: '', orderNumber: 1 }],
    sciTitle: capsule.science?.title ?? '',
    sciText: capsule.science?.text ?? '',
    sciVideoEmbed: science.embed,
    existingScienceVideo: science.existing,
  };
}
