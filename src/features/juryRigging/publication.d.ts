export type LanguageCode = 'en' | 'en-GB' | 'en-US' | 'de' | 'fr'

export type MediaType =
  | 'application/xhtml+xml'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/png'

export type ReadingDirection = 'ltr' | 'rtl'

export type GuideReferenceType =
  | 'cover'
  | 'title-page'
  | 'toc'
  | 'index'
  | 'glossary'
  | 'acknowledgements'
  | 'bibliography'
  | 'colophon'
  | 'copyright-page'
  | 'dedication'
  | 'epigraph'
  | 'foreword'
  | 'loi'
  | 'lot'
  | 'notes'
  | 'preface'
  | 'text'

export type UniqueIdentifier = string

export interface OPF {
  package: {
    dir?: 'ltr' | 'rtl'
    uniqueIdentifier: UniqueIdentifier
    version: '3.0'
    // xml:lang values specified by IETF BCP 47
    xml_lang: LanguageCode
    content: {
      metadata: {
        content: {
          dc_identifier: {}
          dc_title: {}
          dc_language: LanguageCode
          DCMES?: {}
          meta?: {}
          OPF2meta?: {} // legacy
          link?: {}
        }
      }
      manifest: {
        content: {
          id: string
          href: string
          mediaType: MediaType
          fallback?: {}
          properties?: string[]
          mediaOverlay?: {}
        }[]
      }
      spine: {
        id?: UniqueIdentifier
        pageProgressionDirection?: ReadingDirection | 'default'
        toc?: UniqueIdentifier
        content: {
          idref: UniqueIdentifier
          id?: UniqueIdentifier
          linear?: 'yes' | 'no'
          properties?: {}
        }
      }
      collection?: {}
      guide?: {
        // legacy
        content: {
          type: GuideReferenceType
          title: string
          href: string
        }[]
      }
      NCX?: {
        // legacy
      }
    }
  }
}

export interface Publication {
  metadata: {
    identifier: {
      type: 'uuid' | 'isbn'
      id: string
    }
    sourceIdentifier: {
      type: 'isbn'
      id: string
    }
    dates: {
      modified: Date
    }
  }
}
