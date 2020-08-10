/*

{
  attributes: {},
  runs: []
}

*/

export interface R {
  text: string
}

export interface P {
  attributes: {}
  runs: R[]
}

function paragraphOf (runs = [], attributes = {}) {
  return {
    attributes,
    runs,
    addRun: (run: R) => paragraphOf([...runs, run], attributes)
  }
}

export class Run {
  value: R

  static of () {
    return new Run()
  }
}

export class Paragraph {
  value: P

  constructor (runs = [], attributes = {}) {
    this.value = {
      attributes,
      runs
    }
  }

  static of (runs?: R[], attributes?) {
    return new Paragraph(runs, attributes)
  }
}
