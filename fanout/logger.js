// amqp is a client for rabbitmq. It uses the AMQP 0-9-1 protocol
import amqp from 'amqplib/callback_api.js'

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    // required because publishing to a non-existing exchange is forbidden
    const exchange = 'logs'

    // the content of a message is a byte array, so it can be encoded in any format
    const msg = process.argv.slice(2).join(' ') || 'hi daddy'

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    })

    // here, passing an empty string as the second parameter tells the server to generate a random queue
    // for us. We are only interested in the logs exchanger
    channel.publish(exchange, '', Buffer.from(msg))

    console.log(` [x] Sent ${msg}`)
  })

  setTimeout(() => {
    connection.close()
    process.exit(0)
  }, 500)
});


