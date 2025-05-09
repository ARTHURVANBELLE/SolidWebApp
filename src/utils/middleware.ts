import { createMiddleware } from '@solidjs/start/middleware'
 
export default createMiddleware({
  onBeforeResponse: (event) => {
    event.response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081')
    event.response.headers.set('Access-Control-Allow-Credentials', 'true')
  },
})