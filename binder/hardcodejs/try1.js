const Fs = require('fs/promises')
const Path = require('path')
const { pipe, flow } = require('fp-ts/function')
const sharp = require('sharp')
const { processHtmlHACK } = require('../processing')
const { hashString } = require('../lib')

const readFile = (path) => Fs.readFile(path, { encoding: 'utf-8' })
const writeFile = (path, data) =>
  Fs.writeFile(path, data, { encoding: 'utf-8' })
const readJson = (path) => readFile(path).then((json) => JSON.parse(json))

const buildPath =
  'C:\\Users\\timot\\OneDrive\\MrLasers\\Projects\\M\\Mi Ae Lipe\\A Practical Reference\\build'

const footnotes = readJson(Path.join(buildPath, 'footnotes.json'))

const processHtml = (file) =>
  footnotes.then((footnotes) =>
    processHtmlHACK({
      title: file.title,
      pretty: true,
      bodyClass: file.bodyClass,
      footnotes
    })(file)
  )

const tap = (fun) => (x) => {
  fun(x)
  return x
}
const map = (fun) => (mappable) => mappable.map(fun)
const filter = (fun) => (filterable) => filterable.filter(fun)
const pick = (prop) => (obj) => obj[prop] || null
const promiseAll = (proms) => Promise.all(proms)

const liftFile = (file) => (file.filename ? file : { filename: file })

const processContent = (file) => {
  const prom = file.html
    ? Promise.resolve(file.html)
    : readFile(Path.join(buildPath, 'source', 'xhtml', file.filename))
  return prom
    .then((html) => {
      const hash = hashString(html)

      if (hash === file.hash) {
        return { _tag: 'SKIPPED', msg: `No changes to ${file.filename}` }
      }

      return processHtml({
        _tag: 'CONTENT',
        ...file,
        outputFile: Path.join(buildPath, 'output', 'Content', file.filename),
        html: html,
        manifest: {
          ...file,
          hash
        }
      })
    })
    .catch((err) => ({
      _tag: 'ERROR',
      msg: `CONTENT_ERROR: Error reading file ${file.filename}`
    }))
}

const processImage = (file) => {
  // console.log(file.level)
  if (!file.title && !file.caption) {
    return {
      _tag: 'ERROR',
      msg: `IMAGE_ERROR: No title supplied for ${file.filename}`
    }
  }

  return {
    ...processHtml({
      _tag: file.title ? 'SECTION' : 'IMAGE',
      ...file,
      toc: file.title && file.toc ? file.toc : false,
      outputFile: Path.join(
        buildPath,
        'output',
        'Content',
        `${Path.basename(file.filename, '.jpg')}.xhtml`
      ),
      html: `<html><body><figure><img src="../Images/${file.filename}" alt="${file.title}"/><figcaption>${file.title}</figcaption></figure></body></html>`
    }),
    headings:
      typeof file.level === undefined
        ? []
        : [
            {
              id: '',
              level: file.level,
              text: file.title,
              html: file.title
            }
          ]
  }
}

const sizeAndSaveImage = (width, height, quality = 65) =>
  sharp(Path.join(buildPath, 'source', 'images', file.filename))
    .resize(width, height, { fastShrinkOnLoad: false })
    .jpeg({
      mozjpeg: true,
      quality: quality
    })
    .toFile(Path.join(buildPath, 'output', 'Images', file.filename))
    .then(() => {
      // return
      return {
        _tag: 'IMAGE',
        ...file
      }
    })
    .catch((err) => {
      return {
        _tag: 'IMAGE_ERROR',
        ...file
      }
    })

const configuration = readJson(Path.join(buildPath, 'files-manifest.json'))

const headingsToHtml = pipe(filter((heading) => heading.level))

const assignTag = (file) => {
  let tag = 'UNKNOWN'

  if (file.factory) {
    tag = 'FACTORY'
  } else if (file?.filename.match(/\.(xhtml|html|htm)/)) {
    tag = 'CONTENT'
  } else if (file?.filename.match(/\.(jpg|jpeg|gif|png)/)) {
    tag = 'IMAGE"'
  } else {
    tag = 'UNKNOWN'
  }

  return {
    _tag: tag,
    ...file
  }
}

const assignProcess = flow(
  map(
    flow(liftFile, (file) => {
      switch (file.factory) {
        case 'toc':
          return Promise.resolve(factoryToc(file))
      }
      // if (file.factory) {
      //   console.log('factory:', file.factory)
      //   return file
      // }

      if (file?.filename.match(/\.(xhtml|html|htm)/)) {
        return processContent(file)
      }

      if (file?.filename.match(/\.(jpg|jpeg|gif|png)/)) {
        return processImage(file)
      }

      return file
    })
  ),
  promiseAll
)

function doFactories(data) {
  // do factory creation
  return {
    ...data,
    files: data.files.map((file) => {
      switch (file.factory) {
        default:
          return file
        case 'toc':
          return factoryToc(file, data)
      }
    })
  }
}

function factoryToc(file) {
  return (data) => {
    if (!data.headings) {
      return {
        _tag: 'FACTORY_ERROR',
        message: 'toc factory'
      }
    }

    console.log('headings:', data)

    const html = data.headings.reduce((acc, val) => {
      return !val.level
        ? acc
        : acc +
            `<p class="toc${val.level}"><a href="${
              val.filename + (!val.id ? '' : `#${val.id}`)
            }">${val.text}</a></p>`
    }, '<h1>Table of Contents--</h1>')

    return processContent({ ...file, html })
  }
}

function extractPagesAndHeadings(files) {
  return {
    files,
    pages: files.reduce((acc, val) => {
      const updatedPages = !val.pages
        ? []
        : val.pages.map((page) => ({
            ...page,
            filename: val.filename
          }))
      return [...acc, ...updatedPages]
    }, []),
    headings: files.reduce((acc, val) => {
      const headings = !val.headings
        ? []
        : val.headings.map((heading) => ({
            ...heading,
            filename: val.filename
          }))
      return [...acc, ...headings]
    }, [])
  }
}

/**
 * manifestJson --> Tagged({ _tag, ...manifestJson })
 * Tagged --> assignProcess -->Processed({ html, ...Tagged })
 * Processed --> postProcess --> Final(Processed)
 */

configuration
  // .then((json) => json.files)
  .then(map(liftFile))
  .then(map(assignTag))
  .then(assignProcess)
  // .then(map((file) => [file.filename, file._tag]))
  // .then(filter((item) => item._tag === 'ERROR'))

  // .then(async (data) => {
  //   // run the functions
  //   return {
  //     ...data,
  //     files: await Promise.all(data.files.map((file) => file(data)))
  //   }
  // })
  .then(extractPagesAndHeadings)
  .then((data) => data.files.filter((file) => file._tag === 'FACTORY'))
  // .then(doFactories)
  // .then(tap((x) => console.log(x.headings)))
  // .then((data) => {
  //   return {
  //     ...data,
  //     files: data.files.map((item) => {
  //       const { html, ...rest } = item
  //       return rest
  //     })
  //   }
  // })
  // # write xhtml files
  // .then(
  //   tap((data) =>
  //     data.files.map((item) => {
  //       if (item._tag === 'CONTENT') {
  //         console.log(`tapping ${item.filename}`)
  //         writeFile(item.outputFile, item.html).catch(console.error)
  //       }
  //     })
  //   )
  // )
  .then(console.log)

// function headingsToHtml(headings) {
//   return processHtml({
//     title: 'Table of Contents',
//     html: headings.reduce((acc, heading) => {
//       return !heading.level === undefined
//         ? acc
//         : acc +
//             '\n' +
//             `<p class="toc${heading.level}"><a href="${heading.file}${
//               heading.id ? `#${heading.id}` : ''
//             }">${heading.html}</a></p>`
//     }, '')
//   })
// }
