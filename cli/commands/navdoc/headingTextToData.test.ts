import * as TtoD from './headingTextToData'

// Section09.xhtml	1	start	Chapter One: Fire Scar

it('parses a heading line to FileData', () => {
  expect(TtoD.lineToData(`Hello.xhtml\t1\tstart\tHello, World!`)).toEqual({
    file: `Hello.xhtml`,
    fragment: `start`,
    level: 1,
    title: `Hello, World!`,
    children: []
  })
})
