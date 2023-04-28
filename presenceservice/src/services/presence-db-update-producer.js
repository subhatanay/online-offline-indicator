const {Kafka} = require('kafkajs');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function() {
    const kafkaInstance  = new Kafka({
        clientId: process.env.KAFKA_CLIENTID,
        brokers: [process.env.KAFKA_BOOTSRAP_SERVER],
        ssl: false,
        logLevel: 2
    });

    var producer;

    async function initializeKafkaProducer() {
        console.log("Initalizing Kafka producer");
        producer = kafkaInstance.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000
        })
        await producer.connect();
        console.log("Producer successfully initialized"); 
    }

    
    initializeKafkaProducer().catch(console.error);

    return {
        publishMessage :function (key, message) {
            producer.send({
                topic: process.env.KAFKA_TOPIC,
                messages: [
                    {key: key, value: message}
                ]
            })
        }
    }
}