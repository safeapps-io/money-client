export const accentTags = { tagO: '<span class="has-text-weight-bold">', tagC: '</span>' },
  codeTags = { tagO: '<code>', tagC: '</code>' },
  generateLinkTags = (href: string, newWindow = true, prefix = 'link') => ({
    [`${prefix}O`]: `<a href="${href}"${
      newWindow ? ' target="_blank" rel="noopener noreferrer"' : ''
    }>`,
    [`${prefix}C`]: '</a>',
  });
