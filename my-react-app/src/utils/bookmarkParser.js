// Netscape Bookmark Format, JSON, and CSV Parser & Exporter

export function parseNetscapeBookmarks(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const links = [];
  const collectionsFound = new Set();

  function traverse(node, currentFolder = 'Bookmarks') {
    for (let child of node.children) {
      const tagName = child.tagName?.toUpperCase();

      if (tagName === 'DT') {
        // Look for H3 (Folder header) or A (Bookmark link)
        const h3 = child.querySelector(':scope > h3');
        const a = child.querySelector(':scope > a');
        const dl = child.querySelector(':scope > dl');

        let nextFolder = currentFolder;
        if (h3) {
          nextFolder = h3.textContent.trim() || currentFolder;
          if (nextFolder) collectionsFound.add(nextFolder);
        }

        if (a && a.href && !a.href.startsWith('place:') && !a.href.startsWith('chrome:')) {
          const url = a.href;
          const title = a.textContent.trim() || url;
          const rawTags = a.getAttribute('tags') || '';
          const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [];

          links.push({
            url,
            title,
            collectionName: currentFolder !== 'Bookmarks' ? currentFolder : 'Imported Bookmarks',
            customTags: tags.length ? tags : ['Bookmark'],
            notes: ''
          });
        }

        if (dl) {
          traverse(dl, nextFolder);
        }
      } else if (tagName === 'DL') {
        traverse(child, currentFolder);
      }
    }
  }

  const rootDl = doc.querySelector('dl');
  if (rootDl) {
    traverse(rootDl);
  } else {
    // Fallback: parse all <a> tags directly
    const allAnchors = doc.querySelectorAll('a[href]');
    allAnchors.forEach(a => {
      const url = a.href;
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        links.push({
          url,
          title: a.textContent.trim() || url,
          collectionName: 'Imported Bookmarks',
          customTags: ['Bookmark'],
          notes: ''
        });
      }
    });
  }

  return {
    links,
    collections: Array.from(collectionsFound)
  };
}

export function parseCsvBookmarks(csvContent) {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { links: [] };

  const links = [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const urlIdx = headers.findIndex(h => h === 'url' || h === 'link');
  const titleIdx = headers.findIndex(h => h === 'title' || h === 'name');
  const colIdx = headers.findIndex(h => h === 'collection' || h === 'folder');
  const tagsIdx = headers.findIndex(h => h === 'tags' || h === 'tag');

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV row parser handling quotes
    const row = [];
    let insideQuotes = false;
    let entry = '';
    for (let char of lines[i]) {
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());

    const url = (urlIdx >= 0 ? row[urlIdx] : row[0])?.replace(/^['"]|['"]$/g, '');
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      const title = (titleIdx >= 0 ? row[titleIdx] : '')?.replace(/^['"]|['"]$/g, '') || url;
      const col = (colIdx >= 0 ? row[colIdx] : '')?.replace(/^['"]|['"]$/g, '') || 'Imported';
      const rawTags = (tagsIdx >= 0 ? row[tagsIdx] : '')?.replace(/^['"]|['"]$/g, '');
      const tags = rawTags ? rawTags.split(';').map(t => t.trim()).filter(Boolean) : [];

      links.push({
        url,
        title,
        collectionName: col,
        customTags: tags,
        notes: ''
      });
    }
  }

  return { links };
}

// Generate standard Netscape Bookmark HTML
export function exportToNetscapeHtml(links, collectionName = 'LinkCollect Bookmarks') {
  const grouped = {};
  links.forEach(l => {
    const col = l.collectionName || collectionName || 'Saved Links';
    if (!grouped[col]) grouped[col] = [];
    grouped[col].push(l);
  });

  const timestamp = Math.floor(Date.now() / 1000);
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  for (const [colName, colLinks] of Object.entries(grouped)) {
    html += `    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">${escapeHtml(colName)}</H3>\n    <DL><p>\n`;
    for (const link of colLinks) {
      const tagsAttr = link.customTags?.length ? ` TAGS="${escapeHtml(link.customTags.join(','))}"` : '';
      html += `        <DT><A HREF="${escapeHtml(link.url || link.link)}" ADD_DATE="${timestamp}"${tagsAttr}>${escapeHtml(link.title || link.url)}</A>\n`;
    }
    html += `    </DL><p>\n`;
  }

  html += `</DL><p>\n`;
  return html;
}

// Generate CSV string
export function exportToCsv(links) {
  const headers = ['Title', 'URL', 'Collection', 'Tags', 'Rating', 'Favorite', 'ReadLater', 'Created'];
  const rows = links.map(l => [
    `"${(l.title || '').replace(/"/g, '""')}"`,
    `"${(l.url || l.link || '').replace(/"/g, '""')}"`,
    `"${(l.collectionName || '').replace(/"/g, '""')}"`,
    `"${(l.customTags || []).join(';').replace(/"/g, '""')}"`,
    l.rating || 0,
    l.isFavorite ? 'Yes' : 'No',
    l.isReadLater ? 'Yes' : 'No',
    `"${l.createdAt || ''}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Download helper
export function triggerFileDownload(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}
