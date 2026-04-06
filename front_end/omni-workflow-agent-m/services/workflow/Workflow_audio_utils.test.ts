import {
  DEFAULT_LONG_AUDIO_PROMPT,
  inferWorkflowAudioMimeType,
  isWorkflowAudioFile,
} from './Workflow_audio_utils';

describe('Workflow_audio_utils', () => {
  test('exports expected default long audio prompt', () => {
    expect(DEFAULT_LONG_AUDIO_PROMPT).toContain('长时录音');
  });

  test('detects audio files by mime type or extension', () => {
    expect(isWorkflowAudioFile({ mimeType: 'audio/mpeg', fileName: 'note.txt' })).toBe(true);
    expect(isWorkflowAudioFile({ fileName: 'meeting.M4A' })).toBe(true);
    expect(isWorkflowAudioFile({ fileName: 'report.pdf', mimeType: 'application/pdf' })).toBe(false);
  });

  test('infers audio mime type with filename fallback', () => {
    expect(inferWorkflowAudioMimeType({ mimeType: 'audio/custom' })).toBe('audio/custom');
    expect(inferWorkflowAudioMimeType({ fileName: 'meeting.mp3' })).toBe('audio/mpeg');
    expect(inferWorkflowAudioMimeType({ fileName: 'unknown.bin' })).toBe('audio/m4a');
  });
});
