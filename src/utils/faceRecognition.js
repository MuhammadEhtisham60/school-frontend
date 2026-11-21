import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;
let loadingPromise = null;

export async function loadFaceModels() {
  if (modelsLoaded) return true;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const MODEL_URL = "/models/face-api";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  })();

  try {
    return await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    throw err;
  }
}

export async function detectSingleFaceDescriptor(inputEl) {
  await loadFaceModels();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.45,
  });

  const detection = await faceapi
    .detectSingleFace(inputEl, options)
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection) return null;

  return {
    descriptor: Array.from(detection.descriptor),
    box: detection.detection.box,
    score: detection.detection.score,
  };
}

export function findBestFaceMatch(descriptor, enrolledProfiles, maxDistance = 0.52) {
  if (!Array.isArray(descriptor) || descriptor.length < 64) return null;
  const query = new Float32Array(descriptor);

  let bestProfile = null;
  let bestDistance = Infinity;

  for (const profile of enrolledProfiles) {
    if (!profile.hasFaceEnrolled || !Array.isArray(profile.faceDescriptor)) continue;
    if (profile.faceDescriptor.length !== descriptor.length) continue;

    const dist = faceapi.euclideanDistance(query, new Float32Array(profile.faceDescriptor));
    if (dist < bestDistance) {
      bestDistance = dist;
      bestProfile = profile;
    }
  }

  if (!bestProfile || bestDistance > maxDistance) return null;

  const confidence = Math.min(99, Math.max(55, Math.round((1 - bestDistance) * 100)));
  return { profile: bestProfile, distance: bestDistance, confidence };
}

export function captureVideoSnapshot(videoEl) {
  if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) return "";
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}
