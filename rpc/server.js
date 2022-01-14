import amqp from 'amqplib/callback_api.js'
import { RbmqInstance } from './amqplib.js'

function fibonacci(n) {
  if (n === 0 || n === 1) return n

  return fibonacci(n - 1) + fibonacci(n - 2)
}


const server = new RbmqInstance(['rpc_queue'])
await server.setUp()
console.log(' [x] Awaiting RPC requests')
await server.consume(
  server.queues.rpcQueue,
  server.defaultChannel,
  (msg) => {
    const n = parseInt(msg.content.toString())
    const fib = fibonacci(n)
    console.log(` [.] fib(${n}) = ${fib}`)

    server.sendToQueue(
      msg.properties.replyTo,
      server.defaultChannel,
      Buffer.from(fib.toString()),
      undefined,
      msg.properties.correlationId
    )

    server.defaultChannel.ack(msg)
  },
  false
)