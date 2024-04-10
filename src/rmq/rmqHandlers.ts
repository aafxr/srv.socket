import {Group} from "../class";
import {Socket} from "socket.io";
import amqp, {Message} from "amqplib/callback_api"

export function rmqHandlers(socketGroups: Group<Socket>){

    function handleRMQMessage(){
        amqp.connect(`amqp://${process.env.RMQ_HOST}`, function(error0, connection) {
            if (error0) throw error0;

            connection.createChannel(function(error1, channel) {
                if (error1) throw error1;

                const exchange = 'action';

                channel.assertExchange(exchange, 'fanout', { durable: false});

                channel.assertQueue('', {
                    exclusive: true
                }, function(error2, q) {
                    if (error2)  throw error2;

                    channel.bindQueue(q.queue, exchange, '');

                    channel.consume(q.queue, function(msg: Message | null) {
                        if(msg && msg.content) {
                            try{
                                const action = JSON.parse(msg.content.toString("utf-8"))
                                let primary_entity_id: string | undefined = undefined
                                if(action?.data?.primary_entity_id) primary_entity_id = action?.data?.primary_entity_id
                                if(action.entity === 'Travel') primary_entity_id = action.data.id

                                if(primary_entity_id){
                                    const subs = socketGroups.getItems(primary_entity_id)
                                    if(subs) subs.forEach(s => s.emit('action', action))
                                }
                            }catch (e){
                                console.error(e)
                            }
                        }
                    }, { noAck: true });
                });
            });
        });
    }

    return {handleRMQMessage}
}