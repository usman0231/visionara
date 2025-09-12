interface ContactFormData {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  projectType?: string | string[];
  budget?: string;
  timeline?: string;
  message?: string;
}

export function contactEmailText(data: ContactFormData) {
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
    data.message || '',
  ].join('\n');
}
