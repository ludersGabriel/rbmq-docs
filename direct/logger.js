// amqp is a client for rabbitmq. It uses the AMQP 0-9-1 protocol
import amqp from 'amqplib/callback_api.js'

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) throw error0

  connection.createChannel((error1, channel) => {
    if (error1) throw error1

    // required because publishing to a non-existing exchange is forbidden
    const exchange = 'direct_logs'
    const args = process.argv.slice(2)
    const msg = args.slice(1).join(' ') || 'hi daddy'
    const severity = (args.length > 0) ? args[0] : 'info'

    channel.assertExchange(exchange, 'direct', {
      durable: false
    })

    // Here, the second parameter binds the exchange to the
    // queue according to severity
    channel.publish(exchange, severity, Buffer.from(msg))

    console.log(` [x] Sent ${msg}`)
  })

  setTimeout(() => {
    connection.close()
    process.exit(0)
  }, 500)
});


