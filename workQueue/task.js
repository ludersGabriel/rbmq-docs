// amqp is a client for rabbitmq. It uses the AMQP 0-9-1 protocol
import amqp from 'amqplib/callback_api.js'

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    // this queue will only be crated at the broker if it doens't exist already
    const queue = 'task_queue'

    // the content of a message is a byte array, so it can be encoded in any format
    const msg = process.argv.slice(2).join(' ') || 'hi daddy'

    channel.assertQueue(queue, {
      durable: true
    })

    channel.sendToQueue(queue, Buffer.from(msg), {
      persistent: true
    })
    console.log(` [x] Sent ${msg}`)
  })

  setTimeout(() => {
    connection.close()
    process.exit(0)
  }, 500)
});


