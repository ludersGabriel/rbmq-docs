import amqp from 'amqplib/callback_api.js'

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    var queue = 'task_queue'

    channel.assertQueue(queue, {
      durable: true
    })
    channel.prefetch(1)
    console.log(` [*] Waiting for messages in ${queue}. Press CTRL + C to exit`)

    channel.consume(queue, (msg) => {
      const secs = msg.content.toString().split('.').length - 1
      console.log(` [x] Received ${msg.content.toString()}`)

      setTimeout(() => {
        console.log('\t [x] Done')
        channel.ack(msg)
      }, secs * 1000)

    }, {
      // manual acknowledgement mode
      noAck: false
    })
  })
})