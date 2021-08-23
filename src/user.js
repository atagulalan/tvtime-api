const cheerio = require('cheerio')
const utils = require('./utils')

/**
 * Login tvtime.com
 * @param {string} user
 * @param {string} passw
 * @param {boolean} force
 */
function login (user, passw, force = false) {
  return new Promise((resolve, reject) => {
    if (utils.isLogin() && !force) {
      resolve('Using stored credentials...')
      return
    }

    utils.post('/signin', {
      'username': user,
      'password': passw
    })
    .then(_ => getUser().then(resolve).catch(reject))
    .catch(reject)
  })
}

/**
 * Get Id User Profile
 */
function getUser () {
  return new Promise((resolve, reject) => {
    if (!utils.isLogin()) {
      reject('Couldn\'t login.')
      return
    }
    utils.get('/en')
      .then(resp => {
        let body = cheerio.load(resp.body)
        let linkProfile = body('li.profile a').attr('href').split('/')
        utils.setUser(resolve, linkProfile[3])
      })
      .catch(reject)
  })
}

/**
 * Exit
 */
function signOut () {
  if (!utils.isLogin())
    return new Promise((res,rej)=>rej('Already logged out.'))

  return utils.get('/signout')
}

module.exports = { login, signOut }
