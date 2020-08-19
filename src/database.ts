import Sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import Path from 'path'
import SQL from 'sql-template-strings'

export function insertBook(db, { title, author }) {
  return db.run(
    SQL`INSERT INTO Books (title, author) VALUES (${title}, ${author})`
  )
}

export function getBookById(db, id) {
  return db.get(SQL`SELECT * FROM Books WHERE id = ${id}`)
}

export function getBooks(db) {
  return db.all('SELECT * FROM Books')
}

export function configureDB(db) {
  return {
    insertBook: ({ title, author }) =>
      db.run(
        SQL`INSERT INTO Books (title, author) VALUES (${title}, ${author})`
      )
  }
}

export default async (file = '/tmp/database.db') => {
  // console.log('process.cwd()', process.cwd())
  const db = await open({
    filename: Path.join(process.cwd(), file),
    driver: Sqlite3.cached.Database
  })

  await db.migrate({ force: true }).catch(console.error)
  await insertBook(db, {
    title: 'Hello, World!: An Introduction to Ebook Development',
    author: 'Timothy Pew'
  })
  await insertBook(db, {
    title:
      'Hello, World! 2: Electrical Boogaloo -- An Intermediate’s Guide to Ebook Development',
    author: 'Timothy Pew'
  })
  db.all('SELECT * FROM Books').then((data) => console.log('Books:', data))
  // console.log('all books:', await getBooks(db))
  return db
}
