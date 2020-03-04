'use strict'

const rpcDaemon = require('@arqma/arqma-rpc').RPCDaemon
const fs = require('fs')

// Choose the steps
const step = 100

// Output format for https://github.com/arqma/arqma/blob/master/src/checkpoints/checkpoints.cpp#L173
// ADD_CHECKPOINT(0, "60077b4d5cd49a1278d448c58b6854993d127fcaedbdeab82acff7f7fd86e328");

async function getData () {
  try {
    const daemonClient = rpcDaemon.createDaemonClient({
      url: 'http://127.0.0.1:52922'
    })
    // When using a self signed certificate with HTTPS you need to set the function sslRejectUnauthorized to false.
    daemonClient.sslRejectUnauthorized(false)

    const writeStream = fs.createWriteStream('checkpoints.txt')

    // get actual blockchain height
    const info = await daemonClient.getInfo()
    const height = info.height
    // Loop in steps to get block_hash
    for (var i = 0; i < height; i += step) {
      const block = await daemonClient.getBlockHeaderByHeight({ height: i })
      writeStream.write(`ADD_CHECKPOINT(${i}, "${block.block_header.hash}");\n`, 'utf8')
      console.log(`ADD_CHECKPOINT(${i}, "${block.block_header.hash}");`)
    }
    writeStream.end()
  } catch (error) {
    console.error(error)
  }
}

getData()
