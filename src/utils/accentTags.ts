export const accentTags = { tagO: '<span class="has-text-weight-bold">', tagC: '</span>' },
  codeTags = { tagO: '<code>', tagC: '</code>' },
  markTags = {
    markO: '<mark>',
    markC: '</mark>',
    markGrO: '<mark class="green">',
    markBO: '<mark class="blue">',
    markRO: '<mark class="red">',
  },
  generateLinkTags = (href: string, newWindow = true, prefix = 'link') => ({
    [`${prefix}O`]: `<a href="${href}"${
      newWindow ? ' target="_blank" rel="noopener noreferrer"' : ''
    }>`,
    [`${prefix}C`]: '</a>',
  });
