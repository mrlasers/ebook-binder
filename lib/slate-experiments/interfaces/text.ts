export interface TextVal {
  text: string
  [key: string]: unknown
}

export class Text {
  #value: TextVal

  constructor(value: TextVal) {
    this.#value = value
  }

  static of(value: TextVal) {
    return new Text(value)
  }

  value() {
    return this.#value
  }

  equals(other: Text) {
    const another = other.value()

    for (const key in this.#value) {
      if (this.#value[key] !== another[key]) {
        return false
      }
    }

    for (const key in another) {
      if (this.#value[key] !== another[key]) {
        return false
      }
    }

    return true
  }
}
