import { Note } from '@/shared/lib/types'

// Strip HTML tags helper
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Convert HTML to simple Markdown format
const htmlToMarkdown = (html: string): string => {
  if (!html) return ''
  let md = html
  
  // Headers
  md = md.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
  md = md.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
  md = md.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
  
  // Lists & Checklists
  md = md.replace(/<li data-type="taskItem" data-checked="true">(.*?)<\/li>/g, '- [x] $1\n')
  md = md.replace(/<li data-type="taskItem" data-checked="false">(.*?)<\/li>/g, '- [ ] $1\n')
  md = md.replace(/<li>(.*?)<\/li>/g, '- $1\n')
  md = md.replace(/<ul>/g, '').replace(/<\/ul>/g, '\n')
  md = md.replace(/<ol>/g, '').replace(/<\/ol>/g, '\n')
  
  // Inline formatting
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**')
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*')
  md = md.replace(/<u>(.*?)<\/u>/g, '_$1_')
  md = md.replace(/<s>(.*?)<\/s>/g, '~~$1~~')
  md = md.replace(/<code>(.*?)<\/code>/g, '`$1`')
  
  // Blocks
  md = md.replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n')
  md = md.replace(/<p>(.*?)<\/p>/g, '$1\n\n')
  md = md.replace(/<hr\s*\/?>/g, '---\n\n')
  md = md.replace(/<br\s*\/?>/g, '\n')
  
  // Clean double-newlines and spaces
  return stripHtml(md)
    .replace(/\s+/g, ' ')
    .replace(/# /g, '\n# ')
    .replace(/## /g, '\n## ')
    .replace(/### /g, '\n### ')
    .replace(/- \[ \]/g, '\n- [ ]')
    .replace(/- \[x\]/g, '\n- [x]')
    .replace(/- /g, '\n- ')
    .trim()
}

// Download file utility
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const Exporter = {
  // Export as raw Text file
  toTXT: (note: Note) => {
    const rawText = `TITLE: ${note.title || 'Untitled'}\nDATE: ${note.date}\nLAST UPDATED: ${new Date(note.updatedAt).toLocaleString()}\n\nCONTENT:\n${stripHtml(note.content)}`
    downloadFile(rawText, `${note.title || 'Untitled'}.txt`, 'text/plain;charset=utf-8')
  },

  // Export as Markdown document
  toMarkdown: (note: Note) => {
    const markdown = `# ${note.title || 'Untitled'}\n*Date: ${note.date}*\n*Last Modified: ${new Date(note.updatedAt).toLocaleString()}*\n\n---\n\n${htmlToMarkdown(note.content)}`
    downloadFile(markdown, `${note.title || 'Untitled'}.md`, 'text/markdown;charset=utf-8')
  },

  // Export as Microsoft Word DOCX envelope (Word parses HTML pages with doc/docx extension beautifully)
  toDOCX: (note: Note) => {
    const htmlEnvelope = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <title>${note.title || 'Untitled'}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333333; }
          h1 { font-family: Georgia, serif; font-size: 24pt; color: #1a1a1a; margin-bottom: 6pt; }
          h2 { font-family: Georgia, serif; font-size: 18pt; color: #2c3e50; margin-top: 12pt; margin-bottom: 4pt; }
          h3 { font-family: Georgia, serif; font-size: 14pt; color: #34495e; margin-top: 12pt; margin-bottom: 4pt; }
          p { margin-top: 0; margin-bottom: 8pt; }
          blockquote { border-left: 3pt solid #bdc3c7; padding-left: 10pt; margin-left: 0; color: #7f8c8d; }
          pre { background-color: #f8f9fa; padding: 8pt; border: 1px solid #e9ecef; }
          code { font-family: Consolas, monospace; background-color: #f8f9fa; padding: 2pt 4pt; }
          ul, ol { margin-top: 0; margin-bottom: 8pt; padding-left: 20pt; }
          li { margin-bottom: 2pt; }
        </style>
      </head>
      <body>
        <h1>${note.title || 'Untitled'}</h1>
        <p style="color: #888888; font-style: italic; font-size: 9pt;">Date Created: ${note.date} | Last Modified: ${new Date(note.updatedAt).toLocaleString()}</p>
        <hr style="border-top: 1px solid #eeeeee;" />
        <div style="margin-top: 15pt;">
          ${note.content || '<p><i>No content...</i></p>'}
        </div>
      </body>
      </html>
    `
    downloadFile(htmlEnvelope, `${note.title || 'Untitled'}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  },

  // Export as PDF via high-fidelity print layout window trigger
  toPDF: (note: Note) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
      <head>
        <title>${note.title || 'Untitled'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
          }
          h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 32pt;
            font-weight: 800;
            color: #111111;
            margin-bottom: 8px;
            line-height: 1.2;
          }
          .meta {
            font-size: 10pt;
            color: #666666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eaeaea;
          }
          .content {
            margin-top: 24px;
          }
          blockquote {
            border-left: 4px solid #818cf8;
            padding-left: 16px;
            margin-left: 0;
            color: #4b5563;
            font-style: italic;
          }
          code {
            font-family: Consolas, monospace;
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10.5pt;
          }
          pre {
            background-color: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
          }
          hr {
            border: 0;
            border-top: 1px solid #eaeaea;
            margin: 32px 0;
          }
          ul, ol {
            padding-left: 24px;
          }
          li {
            margin-bottom: 6px;
          }
        </style>
      </head>
      <body>
        <h1>${note.title || 'Untitled'}</h1>
        <div class="meta">
          Date: ${note.date} | Last Modified: ${new Date(note.updatedAt).toLocaleString()}
        </div>
        <div class="content">
          ${note.content}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }
}
