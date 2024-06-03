import * as amqp from 'amqplib';

interface IMessageQueue {
    publish(queueName: string, message: string): Promise<boolean>;
    publishToExchange(exchangeName: string, routingKey: string, message: string): Promise<boolean>;
    fanout(message: string): Promise<boolean>;
    consume(queueName: string): Promise<string>;
}

class RabbitMQMessageQueue implements IMessageQueue {
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    constructor(private uri: string) {}

    private async init() {
        if (!this.connection || !this.channel) {
            this.connection = await amqp.connect(this.uri);
            this.channel = await this.connection.createChannel();
        }
    }

    async publish(queueName: string, message: string): Promise<boolean> {
        await this.init();
        await this.channel.assertQueue(queueName, { durable: true });
        return this.channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
    }

    async publishToExchange(exchangeName: string, routingKey: string, message: string): Promise<boolean> {
        await this.init();
        await this.channel.assertExchange(exchangeName, 'direct', { durable: true });
        return this.channel.publish(exchangeName, routingKey, Buffer.from(message), { persistent: true });
    }

    async fanout(message: string): Promise<boolean> {
        await this.init();
        const exchange = 'fanout_exchange';
        await this.channel.assertExchange(exchange, 'fanout', { durable: true });
        return this.channel.publish(exchange, '', Buffer.from(message));
    }

    async consume(queueName: string): Promise<string> {
        await this.init();
        await this.channel.assertQueue(queueName, { durable: true });

        return new Promise((resolve, reject) => {
            this.channel.consume(queueName, (msg) => {
                if (msg) {
                    this.channel.ack(msg);
                    resolve(msg.content.toString());
                } else {
                    reject('No message received');
                }
            }, { noAck: false });
        });
    }

    async close() {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
    }
}

export default RabbitMQMessageQueue;
