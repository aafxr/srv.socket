import { Socket } from "socket.io";
import { Group } from "../class";
import {
    expenseActionSchema,
    joinSchema,
    leaveSchema,
    limitActionSchema,
    messageSchema,
    travelActionSchema
} from "./schema";

export enum Errors {
    INVALID_PALOAD = "invalid payload",
}

export default function(socketGroups: Group<Socket>){

    function parseMessage(msg: string){
        return msg
        try{
            return JSON.parse(msg)
        }catch (_){
            return
        }
    }

    function log(handler: string, msg: any){
        console.log(handler + ' -> ' + JSON.stringify(msg), typeof msg)
    }

    /**
     * this Socket instance
     * @param msgStr expect {travelID: string}
     */
    function joinToTravel(this: Socket, msgStr: string){
        log('joinToTravel', msgStr)

        const msg: Record<string, any> = parseMessage(msgStr)
        log('joinToTravel', msg)
        const validation = joinSchema.validate(msg)
        if(validation.error) {
            this.emit('travel:join:result', {ok: false, message: validation.error})
            return
        }
        socketGroups.add(msg.travelID, this)
        this.emit('travel:join:result', {ok: true, payload: msg})
    }


    /**
     * this Socket instance
     * @param msgStr expect {travelID: string}
     * @returns 
     */
    function leaveFromTravel(this: Socket, msgStr: string){
        const msg: Record<string, any> = parseMessage(msgStr)
        log('leaveFromTravel', msg)
        const validation = leaveSchema.validate(msg)
        if(validation.error) {
            this.emit('travel:leave:result', {ok: false, message: validation.error})
            return
        }
        socketGroups.delete(msg.travelID, this)
        this.emit('travel:leave:result', {ok: true, payload: msg})
    }


    /**
     * метод для обработки actions от клиентов с измененными полями в travel
     *
     * Полученный action отправляется всем подписанным на данное путешествие пользователям
     * @param msgStr
     */
    function newTravelAction(this: Socket, msgStr: string){
        const msg: Record<string, any> = parseMessage(msgStr)
        log('newTravelAction', msg)
        const validation = travelActionSchema.validate(msg)
        if(validation.error){
            this.emit('travel:action:result', {ok: false, message: validation.error})
            return
        }
        const group = socketGroups.getItems(msg.data.id)
        if(group){
            for(const g of group){
                if(g === this) continue
                g.emit('travel:action', msg)
            }
        }
        this.emit('travel:action:result', {ok: true, payload: msg})
    }


    /**
     * метод для обработки сообщений из чата
     * @param msgStr
     */
    function newTravelMessage(this: Socket, msgStr: string){
        const msg: Record<string, any> = parseMessage(msgStr)
        log('newTravelMessage', msg)
        const validation = messageSchema.validate(msg)
        if(validation.error){
            this.emit('travel:message:result', {ok: false, message: validation.error})
            return
        }
        const group = socketGroups.getItems(msg.primary_entity_id)
        if(group){
            for(const g of group){
                if(g === this) continue
                g.emit('travel:message', msg)
            }
        }
        this.emit('travel:message:result', {ok: true, payload: msg})
    }


    /**
     * обработка и отправка сообщений об изменениях в expense
     * @param msg
     */
    function newExpenseAction(this: Socket, msg: Record<string, any>){
        const validation = expenseActionSchema.validate(msg)
        if(validation.error){
            this.emit('expense:action:result', {ok: false, message: validation.error})
            return
        }

        const group = socketGroups.getItems( msg.data.primary_entity_id )
        if(group){
            for (const g of group){
                if(g === this) continue
                g.emit('expense:action', msg)
            }
        }
        this.emit('expense:action:result', {ok: true, payload: msg})
    }


    /**
     * обработка и отправка сообщений об изменениях в limit
     * @param msg
     */
    function newLimitAction(this: Socket, msg: Record<string, any>){
        const validation = limitActionSchema.validate(msg)
        if(validation.error){
            this.emit('limit:action:result', {ok: false, message: validation.error})
            return
        }

        const group = socketGroups.getItems( msg.data.primary_entity_id )
        if(group){
            for (const g of group){
                if(g === this) continue
                g.emit('limit:action', msg)
            }
        }
        this.emit('limit:action:result', {ok: true, payload: msg})
    }


    /**
     * обработка разрыва соединения с клиентом
     */
    function disconnect(this: Socket){
        log('disconnect', {})
        socketGroups.deleteFromAllGroups(this)
    }


    return {
        joinToTravel,
        leaveFromTravel,
        newTravelAction,
        newTravelMessage,
        disconnect,
        newExpenseAction,
        newLimitAction
    }
}