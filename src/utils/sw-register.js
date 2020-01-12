if ('serviceWorker' in navigator) {
  window.addEventListener('load', register)
}

function register () {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function (reg) {
      if (reg.waiting) {
        emitUpdate()
        return
      }
      reg.onupdatefound = function () {
        var installingWorker = reg.installing
        installingWorker.onstatechange = function () {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              emitUpdate()
            }
          }
        }
      }
    })
    .catch(function (e) {
      console.error('Error during service worker registration:', e)
      unregister()
    })
}

function unregister () {
  navigator.serviceWorker.getRegistration()
    .then(function (registration) {
      if (registration) {
        registration.unregister().then(emitUnregister)
      }
    })
}

function emitUpdate () {
  const event = document.createEvent('Event')
  event.initEvent('sw.update', true, true)
  window.dispatchEvent(event)
}

function emitUnregister () {
  var event = document.createEvent('Event')
  event.initEvent('sw.unregister', true, true)
  window.dispatchEvent(event)
}
