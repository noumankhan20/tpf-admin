// Helpers that make the campaign form safe to persist and safe to restore.
//
// formData holds File objects (images, documents, video) plus blob:/data: previews. JSON
// turns a File into {} and restoring that crashes the form (URL.createObjectURL({}) throws).
// So a draft stores the plain fields as JSON and the files as Wasabi links:
//   save    -> new Files are uploaded to Wasabi, their keys are stored with the draft
//   restore -> files are fetched back from those keys and rebuilt as real File objects,
//              so the normal Deploy flow keeps working untouched.

export const CAMPAIGN_DRAFT_KEY = 'campaign_cms';
export const LOCAL_DRAFT_KEY = 'tpf_campaign_cms_draft';

const isTransientUrl = (v) => typeof v === 'string' && (v.startsWith('blob:') || v.startsWith('data:'));
const asArray = (v) => (Array.isArray(v) ? v : []);
const isBlob = (v) => typeof Blob !== 'undefined' && v instanceof Blob;

/**
 * Splits the form into JSON-safe fields and the files that must be stored separately.
 * `entries` keeps order; a File that already has `draftRef` (uploaded or restored from a
 * draft) is not uploaded again.
 */
export function serializeCampaignDraft(formData) {
  const entries = [
    ...asArray(formData.images).filter(isBlob).map((file) => ({ kind: 'image', file })),
    ...asArray(formData.documents).filter(isBlob).map((file) => ({ kind: 'document', file })),
    ...(isBlob(formData.video) ? [{ kind: 'video', file: formData.video }] : []),
  ];
  const data = {
    ...formData,
    images: [],
    documents: [],
    video: null,
    imagePreview: isTransientUrl(formData.imagePreview) ? null : formData.imagePreview ?? null,
    videoPreview: isTransientUrl(formData.videoPreview) ? null : formData.videoPreview ?? null,
  };
  return { data, entries };
}

/** Turns uploaded entries into the file references stored with the draft. */
export function toFileRefs(entries) {
  return entries
    .filter((e) => e.file.draftRef)
    .map((e) => ({ ...e.file.draftRef, kind: e.kind }));
}

/**
 * Rebuilds real File objects from stored references.
 * `urlFor(key)` resolves a Wasabi key to a fetchable URL.
 */
export async function rehydrateDraftFiles(refs, urlFor, fetchImpl = fetch) {
  const out = { images: [], documents: [], video: null, failed: [] };
  for (const ref of asArray(refs)) {
    try {
      const res = await fetchImpl(urlFor(ref.key));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], ref.name || 'file', { type: ref.mimeType || blob.type });
      file.draftRef = { key: ref.key, name: ref.name, mimeType: ref.mimeType, size: ref.size };
      if (ref.kind === 'image') out.images.push(file);
      else if (ref.kind === 'document') out.documents.push(file);
      else if (ref.kind === 'video') out.video = file;
    } catch {
      out.failed.push(ref.name || ref.key);
    }
  }
  return out;
}

/**
 * Builds the form to show after restore. Plain fields always get safe shapes, even from a
 * legacy draft saved before files were handled. `files` comes from rehydrateDraftFiles.
 */
export function restoreCampaignDraft(saved, current, files = {}, makeUrl = (f) => URL.createObjectURL(f)) {
  const s = saved && typeof saved === 'object' ? saved : {};
  const out = { ...current, ...s };

  out.images = asArray(files.images).filter(isBlob);
  out.documents = asArray(files.documents).filter(isBlob);
  out.video = isBlob(files.video) ? files.video : null;

  out.allowedDonationTypes = asArray(out.allowedDonationTypes);
  out.existingDocuments = asArray(out.existingDocuments);
  out.imageGallery = asArray(out.imageGallery);
  out.impactGoals = asArray(out.impactGoals).length ? out.impactGoals : [''];

  out.socialLinks = { ...(current?.socialLinks || {}), ...(s.socialLinks || {}) };
  out.unitConfig = {
    ...(current?.unitConfig || {}),
    ...(s.unitConfig || {}),
    presets: asArray(s.unitConfig?.presets ?? current?.unitConfig?.presets),
  };

  if (isTransientUrl(out.imagePreview)) out.imagePreview = null;
  if (isTransientUrl(out.videoPreview)) out.videoPreview = null;

  if (out.images.length) {
    out.imagePreview = makeUrl(out.images[0]);
    out.isExistingImage = false;
  } else if (!out.imagePreview && out.mediaType === 'image' && out.selectedImageUrl) {
    out.imagePreview = out.selectedImageUrl;
  }
  if (out.video) {
    out.videoPreview = makeUrl(out.video);
    out.isExistingVideo = false;
  } else if (!out.videoPreview && out.mediaType === 'video' && out.selectedVideoUrl) {
    out.videoPreview = out.selectedVideoUrl;
  }

  return out;
}

export function describeDropped(entries) {
  const count = (kind) => entries.filter((e) => e.kind === kind).length;
  const parts = [];
  if (count('image')) parts.push(`${count('image')} image${count('image') > 1 ? 's' : ''}`);
  if (count('document')) parts.push(`${count('document')} document${count('document') > 1 ? 's' : ''}`);
  if (count('video')) parts.push('the video');
  return parts.length ? `Re-attach ${parts.join(', ')} after restoring.` : '';
}

export function readLocalDraft() {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;
    const { formData, timestamp } = JSON.parse(raw);
    if (!formData || typeof formData !== 'object') return null;
    return { formData, files: [], savedAt: timestamp || null };
  } catch {
    return null;
  }
}

export function writeLocalDraft(formData, savedAt) {
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({ formData, timestamp: savedAt }));
  } catch {
    /* storage full or unavailable; the server copy is the source of truth */
  }
}

export function clearLocalDraft() {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// Newest of the server and local copies wins.
export function pickNewestDraft(server, local) {
  if (!server) return local;
  if (!local) return server;
  return new Date(server.savedAt || 0) >= new Date(local.savedAt || 0) ? server : local;
}
