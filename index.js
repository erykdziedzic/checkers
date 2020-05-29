const http = require('http')
const fs = require('fs')
const path = require('path')
const qs = require('querystring')

let server = http.createServer(function (request, response) {
  if (request.method === 'POST') {
    parsePost(request, response)
    return
  }

  let filePath = request.url.replace(/(\/)\/+/g, '$1')
  console.log('request', request.connection.remoteAddress, filePath)

  filePath = 'static' + filePath
  if (filePath == 'static/') {
    filePath = 'static/index.html'
  }

  let extname = String(path.extname(filePath)).toLowerCase()
  const mimeTypes = {
    '.html': 'text/html;charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml',
  }

  let contentType = mimeTypes[extname] || 'application/octet-stream'

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        fs.readFile('static/404.html', function (error, content) {
          response.writeHead(404, { 'Content-Type': mimeTypes['.html'] })
          response.end(content, 'utf-8')
        })
      } else {
        response.writeHead(500)
        response.end(
          'Sorry, check with the site admin for error: ' + error.code + ' ..\n'
        )
        response.end()
      }
    } else {
      response.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      })
      response.end(content, 'utf-8')
    }
  })
})

function newBoard() {
  return [
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
  ]
}

let players = []

let board = newBoard()

function parsePost(request, response) {
  let allData = ''

  request.on('data', function (data) {
    allData += data
  })
  let clear = false
  request.on('end', function (data) {
    let finish = qs.parse(allData) // Getting Positions from Client
    let responseData = {
      action: finish.action,
    }
    console.log(finish)
    if (finish.action == 'CHECK_USER') {
      responseData.players = players.length
    } else if (finish.action == 'GET_STATE') {
      responseData.board = board
    } else if (finish.action == 'RESET_ALL') {
      board = newBoard()
      players = []
    } else if (finish.action == 'MOVE') {
      ;({ x1, y1, x2, y2 } = finish) // https://developer.mozilla.org/pl/docs/Web/JavaScript/Referencje/Operatory/Destructuring_assignment
      console.log('from: ', x1, y1, board[y1][x1])
      console.log('to: ', x2, y2, board[y2][x2])
      board[y2][x2] = board[y1][x1]
      board[y1][x1] = 0
      responseData = { ...responseData, x1, y1, x2, y2 } // tu się chyba nic nie zmienia, ale można coś dołożyć
    } else if (finish.action == 'ADD_USER') {
      let userData
      if (players.length == 0) {
        userData = {
          username: finish.username,
          color: 'white',
          id: 0,
        }
      } else if (players.length == 1) {
        userData = {
          username: finish.username,
          color: 'red',
          id: 1,
        }
      } else if (players.length > 1) {
        responseData.error = 'Brak miejsca.'
      }
      players.push(userData)
      responseData.userData = userData
    }
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(responseData)) // Sending Them to Client from server
  })
}

server.listen(3000)
console.log('Server running at http://127.0.0.1:3000/')
