// https://idpf.github.io/epub-vocabs/structure/
export type EpubDocumentPartitions =
  | 'cover'
  | 'frontmatter'
  | 'bodymatter'
  | 'backmatter'

export type EpubDocumentDivisions = 'volume' | 'part' | 'chapter'

export type EpubDocumentSections =
  | 'abstract'
  | 'foreword'
  | 'preface'
  | 'prologue'
  | 'introduction'
  | 'preamble'
  | 'conclusion'
  | 'epilogue'
  | 'afterword'
  | 'epigraph'

export type EpubNavigation = 'toc' | 'landmarks' | 'loi' | 'lot' | 'lov'

export type EpubReferenceSections = 'appendix' | 'colophon'

export type EpubIndexes = 'index'

export type EpubGlossary = 'glossary'

export type EpubBibliography = 'bibliography'

export type EpubPreliminarySections =
  | 'titlepage'
  | 'halftitlepage'
  | 'copyright-page'
  | 'acknowledgments'
  | 'dedication'

export type EpubLandmark =
  | EpubDocumentPartitions
  | EpubDocumentDivisions
  | EpubDocumentSections
  | EpubNavigation
  | EpubReferenceSections
  | EpubIndexes
  | EpubGlossary
  | EpubBibliography
  | EpubPreliminarySections
