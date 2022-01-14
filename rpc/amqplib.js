import amqp from 'amqplib'

export class RbmqInstance {
  queues = {}
  correlationIds = []
  constructor(queues) {
    for (const queue of queues) {
      this.queues[this.toCamelCase(queue)] = queue
    }
  }

  // sets up the default connection and channel. Also asserts all the queues passed
  // and makes them not durable
  async setUp() {
    this.defaultConnection = await this.getConnection()
    this.defaultChannel = await this.getChannel(this.defaultConnection)
    this.defaultChannel.prefetch(1)
    for (const queue of Object.keys(this.queues)) {
      this.defaultChannel.assertQueue(
        this.queues[queue],
        {
          durable: false
        }
      )
    }
  }

  // simple function to convert any string to camelCase
  toCamelCase(str) {
    var retVal = '';

    retVal = str.trim()
      .replace(/[^A-Za-z]/g, ' ')
      .replace(/(.)/g, function (a, l) { return l.toLowerCase(); })
      .replace(/(\s.)/g, function (a, l) { return l.toUpperCase(); })
      .replace(/[^A-Za-z\u00C0-\u00ff]/g, '');

    return retVal
  }

  // simple function to mock an uuid
  generateUuid() {
    return Math.random().toString() +
      Math.random().toString() +
      Math.random().toString();
  }

  // creates a connection to the rbmq server at url
  async getConnection(url = 'amqp://localhost') {
    return amqp.connect(url)
  }

  // creates a channel based on a connection
  async getChannel(connection) {
    return connection.createConfirmChannel()
  }

  // creates a queue based on a channel
  async getQueue(channel) {
    return channel.assertQueue('', { durable: true, exclusive: true })
  }

  // sends a given message to a queue at a given channel. 
  // Can be specified which channel to reply to and a 
  // specific corretlationId to apply to the message
  async sendToQueue(queue, channel, message, replyTo = '', correlationId = '') {
    console.log(` [.] sending ${message} to queue ${queue}`)

    if (!correlationId) {
      correlationId = this.generateUuid()
      this.correlationIds.push(correlationId)
    }

    channel.sendToQueue(
      queue, Buffer.from(message.toString()),
      {
        persistent: true,
        correlationId: message.correlationId ?
          message.correlationId : correlationId,
        replyTo: replyTo ? replyTo : undefined
      }
    )
    await channel.waitForConfirms()
  }

  // a common client callback. Just shows the return value
  callback = (msg) => {
    if (this.correlationIds.includes(msg.properties.correlationId)) {
      // here you could process the response
      console.log(` [x] Got ${msg.content.toString()}`)

      const index = this.correlationIds.indexOf(msg.properties.correlationId)
      this.correlationIds.splice(index, 1)

      if (!this.correlationIds.length) {
        console.log('No more messages to consume. Killing client')
        process.exit(1)
      }
    }
  }

  // pretty standard consume function. Defaults to noAck true and
  // the default callback
  async consume(queue, channel, callback = this.callback, noAck = true) {
    channel.consume(queue, callback, { noAck })
    await channel.waitForConfirms()
  }
}