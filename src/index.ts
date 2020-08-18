import Hapi from '@hapi/hapi'
import Store from 'store'
import { v4 as Uuid } from 'uuid'

import openDb from './database'

const init = async () => {
  const db = await openDb()

  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  })

  await server.start()

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        return 'Hello, World!'
      }
    },
    {
      method: 'GET',
      path: '/books',
      handler: (request, h) => {
        const books = Store.get('books') || []
        return JSON.stringify(books)
      }
    },
    {
      method: 'POST',
      path: '/books',
      handler: (request, h) => {
        const newBook = {
          id: Uuid()
        }
        // const result = Store.set('books', [...])
        return newBook
      }
    }
  ])

  console.log(`Server running on ${server.info.uri}`)

  // dunno if we really need this
  process.on('SIGINT', () => {
    console.log('stopping hapi server')

    server.stop({ timeout: 10000 }).then((err) => {
      console.log('hapi server stopped')
    })
  })
}

init()
