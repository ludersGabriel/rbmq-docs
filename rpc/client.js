// amqp is a client for rabbitmq. It uses the AMQP 0-9-1 protocol
import {
  RbmqInstance
} from './amqplib.js'

const args = process.argv.slice(2)

if (!args.length) {
  console.log('Usage: client.js <num1> ... <numN>')
  process.exit(1)
}

const client = new RbmqInstance(['rpc_queue'])
await client.setUp()

const randomQueue = (await client.getQueue(client.defaultChannel)).queue

for await (const arg of args) {
  await client.sendToQueue(
    client.queues.rpcQueue,
    client.defaultChannel,
    parseInt(arg),
    randomQueue
  )
}

await client.consume(
  randomQueue,
  client.defaultChannel
)
