export const DEFAULT_LONG_AUDIO_PROMPT =
  '请整理这段长时录音的完整内容，转写并生成概要。';

const AUDIO_EXTENSIONS = new Set(['m4a', 'mp3', 'wav', 'aac', 'ogg', 'webm']);

const EXTENSION_MIME_MAP: Record<string, string> = {
  m4a: 'audio/m4a',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
};

function getNormalizedExtension(fileName?: string | null): string {
  if (!fileName || !fileName.includes('.')) {
    return '';
  }

  return fileName.split('.').pop()?.trim().toLowerCase() ?? '';
}

export function isWorkflowAudioFile(params: {
  fileName?: string | null;
  mimeType?: string | null;
}): boolean {
  const mimeType = params.mimeType?.toLowerCase() ?? '';
  const extension = getNormalizedExtension(params.fileName);

  return mimeType.startsWith('audio/') || AUDIO_EXTENSIONS.has(extension);
}

export function inferWorkflowAudioMimeType(params: {
  fileName?: string | null;
  mimeType?: string | null;
}): string {
  const mimeType = params.mimeType?.trim();
  if (mimeType) {
    return mimeType;
  }

  const extension = getNormalizedExtension(params.fileName);
  return EXTENSION_MIME_MAP[extension] ?? 'audio/m4a';
}
