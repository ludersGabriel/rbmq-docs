import amqp from 'amqplib/callback_api.js'

const args = process.argv.slice(2)
if (!args.length) {
  console.log('Usage: define a severity for the receiver')
  process.exit(1)
}

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    const exchange = 'direct_logs'

    channel.assertExchange(exchange, 'direct', {
      durable: false
    })

    // exclusive means its going to get deleted if the server goes down.
    // we only care about current active messages
    channel.assertQueue('', {
      exclusive: true
    }, (error2, q) => {
      if (error2) throw error2

      console.log(` [*] Waiting for messages in ${q.queue}. Press CTRL + C to exit`)

      // here we bind the queue to the severities it listens to
      args.forEach((severity) => channel.bindQueue(q.queue, exchange, severity))

      channel.consume(q.queue, (msg) => {
        console.log(` [x] ${msg.fields.routingKey}: '${msg.content.toString()}'`)

      }, {
        // manual acknowledgement mode
        noAck: false
      })
    })
  })
})