import { applyMiddleware, compose } from 'redux'
import { connectRoutes } from 'redux-first-router'

const routesMap = {
  HOME: '/',
  USER: '/user/:id'
}

const { middleware, enhancer } = connectRoutes(routesMap)

const middlewares = applyMiddleware(middleware)
const enhancers = compose(enhancer, middleware)

// console.log('middleware:', middleware)
// console.log('middlewares:', middlewares)
console.log('enhancer:', enhancer)
console.log('enhancers:', enhancers)
