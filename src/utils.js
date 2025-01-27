const fs = require('fs')
const needle = require('needle')
const urlBase = 'https://www.tvtime.com'

function getCookies () {
  const setting = require(`${__dirname}/access.json`)
  let cookies = {}
  if (setting.tvstRemember.length > 0) {
    cookies = {
      tvstRemember: setting.tvstRemember,
      symfony: setting.symfony
    }
  }
  return cookies
}

function getUser () {
  const setting = require(`${__dirname}/access.json`)
  let userId = 0
  if (setting.user > 0) {
    userId = setting.user
  }
  return userId
}

async function setCookie (callback, obj, remove = false) {
  let setting = require(`${__dirname}/access.json`)
  setting = Object.assign(setting, obj)

  await fs.open(`${__dirname}/access.json`, 'w', (err, d) => {
    if (err) console.error(err)

    fs.write(d, JSON.stringify(setting, null, '\t'), 0, 'utf-8', err => {
      if (err) return err
      callback(remove ? 'Deleting credentials...' : 'Storing credentials...')
    })
  })
}

function setUser (callback, userId = 0) {
  setCookie(callback, {user: userId})
}

function removeAccess () {
  return new Promise((resolve, reject) => {
    setCookie(r => {
        resolve(r)
      }, { tvstRemember: '', symfony: '', user: 0 }, true)
  })
}

function isLogin() {
  return !!getCookies().tvstRemember
}

function get (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: getCookies() }

  return new Promise((resolve, reject) => {
    needle('get', url, data, cookies)
      .then(resp => {
        if (resp.cookies && resp.cookies.tvstRemember === 'deleted') {
          return removeAccess()
            .then(d => {
              resolve(d)
            })
        }

        resolve(resp)
    })
    .catch(err => {
      reject(err)
    })
  })
}

function post (urlPath, data) {
  const url = urlBase + urlPath

  return new Promise((resolve, reject)=> {
    needle('post', url, data)
      .then(resp => {
        let cookies = resp.cookies

        if (cookies.tvstRemember) {
          setCookie(d => {
            resolve(d)
            return
          }, { tvstRemember: cookies.tvstRemember, symfony: cookies.symfony })
        } else {
          resolve('')
        }
      })
      .catch(err => {
        reject(err)
      })
    })
}

function put (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: getCookies() }

  return new Promise((resolve, reject) => {
    needle('put', url, data, cookies)
      .then(resp => {
        if (resp.cookies && resp.cookies.tvstRemember === 'deleted') {
          return removeAccess()
            .then(d => {
              resolve(d)
              return
            })
        }
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = { getUser, setUser, isLogin, get, post, put }
