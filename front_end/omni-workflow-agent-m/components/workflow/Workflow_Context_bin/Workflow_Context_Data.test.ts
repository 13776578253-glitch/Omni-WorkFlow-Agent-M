import type { WorkflowBlock } from '@/constants/workflow_type';
import { MARKDOWN_MOCK_DATA } from './Workflow_Context_Data';

// 测试 Workflow_Context_Data 中的 MARKDOWN_MOCK_DATA 数据结构和内容
describe('Workflow Context Data Integrity', () => {
  // 验证 MARKDOWN_MOCK_DATA 的基本结构
  test('should have valid mock data structure', () => {
    expect(Array.isArray(MARKDOWN_MOCK_DATA)).toBe(true);
    expect(MARKDOWN_MOCK_DATA.length).toBeGreaterThan(0);
  });

  // 验证每个块的基本字段和类型
  test('each block should conform to WorkflowBlock interface', () => {
    MARKDOWN_MOCK_DATA.forEach((block: WorkflowBlock) => {
      expect(block).toHaveProperty('id');
      expect(typeof block.id).toBe('string');

      expect(block).toHaveProperty('role');
      expect(['user', 'ai']).toContain(block.role);

      expect(block).toHaveProperty('content');
      expect(typeof block.content).toBe('string');

      expect(block).toHaveProperty('createdAt');
      expect(typeof block.createdAt).toBe('number');
    });
  });

  // 验证特定块的内容格式（例如，mock-3 应该包含特定的 Markdown 格式）
  test('mock-3 should contain specific markdown formatting', () => {
    const mock3 = MARKDOWN_MOCK_DATA.find(m => m.id === 'mock-3');
    expect(mock3).toBeDefined();
    expect(mock3?.role).toBe('ai');
    // Verify it contains expected markdown syntax for lists
    expect(mock3?.content).toContain('1. **Timeline**');
    expect(mock3?.content).toContain('2. **Action**');
  });
});
