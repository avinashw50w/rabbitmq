const amqp = require('amqplib');

async function createConnection() {
    return amqp.connect("amqp://user:password@localhost:5672");
}

async function createChannel(connection) {
    return connection.createChannel();
}

async function createChannel(connection) {
    return connection.createChannel();
}

async function createExchange(channel, exchangeName, exchangeType = 'direct', options = {}) {
    return channel.assertExchange(exchangeName, exchangeType, options);
}

async function createQueue(channel, queueName, options = {}) {
    return channel.assertQueue(queueName, options);
}

async function bindQueueToExchange(channel, queueName, exchangeName, bindingKey) {
    return channel.bindQueue(queueName, exchangeName, bindingKey);
}

async function consume() {
    try {
        const connection = await amqp.connect("amqp://user:password@localhost:5672");
        const channel = await connection.createChannel();
        await channel.assertQueue("my-queue", {durable: false});
        channel.consume("my-queue", msg => {
            console.log(msg.content.toString());
        }, {
            // automatic acknowledgment mode
            noAck: true
        });
    } catch(ex) {
        console.error(ex)
    }
}

consume();