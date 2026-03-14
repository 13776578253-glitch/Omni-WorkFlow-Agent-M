import { MARKDOWN_MOCK_DATA, WorkflowMessage } from './Workflow_Context_Data';

describe('Workflow Context Data Integrity', () => {
  test('should have valid mock data structure', () => {
    expect(Array.isArray(MARKDOWN_MOCK_DATA)).toBe(true);
    expect(MARKDOWN_MOCK_DATA.length).toBeGreaterThan(0);
  });

  test('each message should conform to WorkflowMessage interface', () => {
    MARKDOWN_MOCK_DATA.forEach((msg) => {
      expect(msg).toHaveProperty('id');
      expect(typeof msg.id).toBe('string');
      
      expect(msg).toHaveProperty('role');
      expect(['user', 'ai']).toContain(msg.role);
      
      expect(msg).toHaveProperty('text');
      expect(typeof msg.text).toBe('string');
    });
  });

  test('mock-3 should contain specific markdown formatting', () => {
    const mock3 = MARKDOWN_MOCK_DATA.find(m => m.id === 'mock-3');
    expect(mock3).toBeDefined();
    expect(mock3?.role).toBe('ai');
    // Verify it contains expected markdown syntax for lists
    expect(mock3?.text).toContain('1. **Timeline**');
    expect(mock3?.text).toContain('2. **Action**');
  });
});
