// ID 生成工具

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

export const ID_PREFIX = {
  person: 'person',
  team: 'team',
  content: 'content',
  source: 'source',
  reminder: 'reminder',
  rule: 'rule',
} as const;
