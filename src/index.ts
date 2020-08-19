import Hapi from '@hapi/hapi'
import Blipp from 'blipp'
import { v4 as Uuid } from 'uuid'

import openDb, { insertBook, getBookById } from './database'

const init = async () => {
  const db = await openDb()

  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
      cors: true
    }
  })

  await server.register({
    plugin: Blipp,
    options: { showAuth: true }
  })

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        return `<html><head><title>Ebook Binder API</title></head><body><p>You probably aren't supposed to be here.</p></body></html>`
      }
    },
    {
      method: 'GET',
      path: '/books',
      handler: (request, h) => {
        return db.all('SELECT * FROM Books').then((books) => {
          console.log('all books:', books)
          return books
        })
      }
    },
    {
      method: 'POST',
      path: '/books',
      handler: async function (request, h) {
        // const newBook = {
        //   id: Uuid()
        // }
        // const result = Store.set('books', [...])

        console.log('request.payload:', typeof request.payload, request.payload)

        if (typeof request.payload !== 'object') {
          console.log('payload is not an object, returning empty string')
          return ''
        }

        const newBook = {
          title: '',
          author: '',
          ...request.payload
        }

        // return { did: 'not get anything' }
        return insertBook(db, newBook).then(({ lastID }) =>
          getBookById(db, lastID)
        )
      }
    },
    {
      method: 'GET',
      path: '/books/{id}',
      handler: (request, h) => {
        const { id } = request.params
        return getBookById(db, id)
      }
    }
  ])

  await server.start()
  console.log(`Server running on ${server.info.uri}`)

  // dunno if we really need this
  process.on('SIGINT', () => {
    console.log('stopping hapi server')

    server.stop({ timeout: 10000 }).then((err) => {
      console.log('hapi server stopped')
      db.close()
    })
  })
}

init()
