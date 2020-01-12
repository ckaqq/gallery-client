/*eslint-disable */
importScripts('https://g.alicdn.com/kg/workbox/4.3.1/workbox-sw.js')

workbox.setConfig({
  modulePathPrefix: 'https://g.alicdn.com/kg/workbox/4.3.1/'
})

workbox.core.skipWaiting()
workbox.core.clientsClaim()

workbox.precaching.precacheAndRoute(self.__precacheManifest || [])

workbox.routing.registerRoute(
  /^http:\/\/gallerys-demo\.test\.upcdn\.net/,
  workbox.strategies.cacheFirst({
    cacheName: 'cdn-images',
    matchOptions: {
      ignoreSearch: true
    },
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 86400 * 8,
        purgeOnQuotaError: true
      })
    ]
  })
)
