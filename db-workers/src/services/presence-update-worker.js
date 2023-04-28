const {Kafka} = require('kafkajs');
const dotenv = require('dotenv');
dotenv.config();
const dbPool = require('../dao/db-pool')
const userActionDao  = require('../dao/user-action-dao')(dbPool);

module.exports =  function() {

    const kafka  = new Kafka({
        clientId: process.env.KAFKA_CLIENTID,
        brokers: [process.env.KAFKA_BOOTSRAP_SERVER],
        ssl: false,
        logLevel: 2
    });

    async function initializeConsumer() {
        console.log("Initailizing Kafka consumer to consume presence updates. Consuming events on " + process.env.KAFKA_TOPIC + " topic.")
        const consumer = kafka.consumer({groupId: process.env.KAFKA_GROUPID});
        await consumer.connect()
        await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

        console.log("Successfully connected to kafka.")

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => { 
             
              try {
                var userId = parseInt(message.key.toString());
                var userEvent = JSON.parse(message.value.toString());

                if (userId && userEvent) {
                    console.log (`Got a event for updating user ${userId} to status ${userEvent.status}. Updating status to db.`);
                    userActionDao.updateUser(userId,userEvent.status == 'online' ? 1 : 0,null);
                }
              } catch (e) {
                console.log ("Failed to handle the event. Error reason :: " , e);
              } 
            }
        }) 
    }

    initializeConsumer().catch(console.error);

}