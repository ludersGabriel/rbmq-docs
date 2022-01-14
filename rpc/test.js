import { RbmqInstance } from "./amqplib.js"

const client = new RbmqInstance(['rpc_queue', 'test_queue'])
await client.setUp()

console.log(client.queues)

process.exit(1)