export const accentTags = { tagO: '<span class="has-text-weight-bold">', tagC: '</span>' },
  codeTags = { tagO: '<code>', tagC: '</code>' },
  generateLinkTags = (href: string, newWindow = true) => ({
    linkO: `<a href="${href}"${newWindow ? ' target="_blank" rel="noopener noreferrer"' : ''}>`,
    linkC: '</a>',
  });
