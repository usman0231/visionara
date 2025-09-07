// lib/email/contactEmailText.ts
export function contactEmailText(data: Record<string, any>) {
  const types = Array.isArray(data.projectType)
    ? data.projectType.join(', ')
    : data.projectType || 'N/A';

  return [
    'New Visionara Contact',
    '=======================',
    `Name: ${data.name || ''}`,
    `Email: ${data.email || ''}`,
    `Company: ${data.company || ''}`,
    `Phone: ${data.phone || ''}`,
    `Project Type: ${types}`,
    `Budget: ${data.budget || 'N/A'}`,
    `Timeline: ${data.timeline || 'N/A'}`,
    '',
    'Message:',
    (data.message || '').toString(),
  ].join('\n');
}
