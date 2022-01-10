import amqp from 'amqplib/callback_api.js'

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    const exchange = 'logs'

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    })

    // exclusive means its going to get deleted if the server goes down.
    // we only care about current active messages
    channel.assertQueue('', {
      exclusive: true
    }, (error2, q) => {
      if (error2) throw error2

      console.log(` [*] Waiting for messages in ${q.queue}. Press CTRL + C to exit`)
      channel.bindQueue(q.queue, exchange, '')

      channel.consume(q.queue, (msg) => {
        if (msg.content) console.log(` [x] ${msg.content}`)

      }, {
        // manual acknowledgement mode
        noAck: false
      })
    })
  })
})