export function ContainerXML() {
  return `
<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`.trim()
}

export function AppleIbooksDisplayXML() {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<display_options>
  <platform name="*">
    <option name="specified-fonts">true</option>
  </platform>
</display_options>`.trim()
}

export function epubFilenameFromTitle(title?: string) {
  if (typeof title !== 'string') return 'ebook.epub'

  const d = new Date()

  const filenameDate = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map((x) => x.toString().padStart(2, '0'))
    .join('.')

  return (
    title
      .toLowerCase()
      .replace(/[^a-z -]/g, '')
      .split(/\s/)
      .filter((x) => x.length > 3)
      .slice(0, 3)
      .map((word) => word.replace(/^./, (match) => match.toUpperCase()))
      .join('-') +
    '_' +
    filenameDate +
    '-' +
    d.getHours().toString(10) +
    '.epub'
  )
}
