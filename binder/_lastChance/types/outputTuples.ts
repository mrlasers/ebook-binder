export const finalOutputTypes = [
  'content',
  'image',
  'style',
  'xml',
  'other',
  'font'
] as const

export type OutputTupleTypes = typeof finalOutputTypes[number]

export type OutputOperationWrite = {
  type: OutputTupleTypes
  destination: string
  content: string
}

export type OutputOperationCopy = {
  type: OutputTupleTypes
  destination: string
  source: string
}

export type _OutputOperation = OutputOperationWrite | OutputOperationCopy

export type OutputTuple = [
  type: OutputTupleTypes,
  destination: string,
  content: string
]

export function isOutputTuple(ot: any): ot is OutputTuple {
  return (
    Array.isArray(ot) &&
    ot.length === 3 &&
    finalOutputTypes.includes(ot[0]) &&
    typeof ot[1] === 'string' &&
    typeof ot[2] === 'string'
  )
}

export type OutputTupleOptions = {
  sourceImagePath: string
  sourceFontPath: string
  epub?: boolean
}
