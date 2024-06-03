const amqp = require('amqplib');

async function publish(msg) {
    try {
        const connection = await amqp.connect("amqp://user:password@localhost:5672");
        const channel = await connection.createChannel();
        await channel.assertQueue("my-queue", {durable: false});
        channel.sendToQueue("my-queue", Buffer.from(JSON.stringify(msg)));
        console.log('message sent')
    } catch(ex) {
        console.error(ex)
    }
}

const msg = {message: process.argv[2]}
publish(msg);