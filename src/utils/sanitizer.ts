import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

export const sanitizeText = (text: string): string => {
  return text.trim().slice(0, 1000); // Limit length and trim whitespace
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
  const sanitized = sanitizeText(name);
  return sanitized.length >= 2 && sanitized.length <= 50;
};