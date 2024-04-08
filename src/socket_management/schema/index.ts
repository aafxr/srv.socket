import Joi from "joi";

/**
 * В данном файле представлены схемы описывающие валидацию принимаемых от клиентов данных
 */


/**
 * валидация сообщения подключения к группе по travelID
 */
export const joinSchema = Joi.object({
    travelID: Joi.array().required()
})


/**
 * валидация сообщения отключения от группы по travelID
 */
export const leaveSchema = joinSchema


/**
 * валидация action с изменениями в travel
 */
export const travelActionSchema = Joi.object({
    entity: Joi.string().required().equal("Travel"),
    data: Joi.object(
        {
            id: Joi.string().required()
        }
    ).options({allowUnknown: true}).required()
}).options({allowUnknown: true})


/**
 * валидация action с изменениями в expense
 */
export const expenseActionSchema = Joi.object({
    entity: Joi.string().pattern(new RegExp('^expense')).required(),
    data: Joi.object(
        {
            id: Joi.string().required(),
            primary_entity_id: Joi.string().required()
        }
    ).options({allowUnknown: true})
}).options({allowUnknown: true})


/**
 * валидация action с изменениями в limit
 */
export const limitActionSchema = Joi.object({
    entity: Joi.string().equal('Limit').required(),
    data: Joi.object(
        {
            id: Joi.string().required(),
            primary_entity_id: Joi.string().required()
        }
    ).options({allowUnknown: true})
}).options({allowUnknown: true})


/**
 * валидация сообщений пользователей в чате
 */
export const messageSchema = Joi.object({
    date: Joi.string().required(),
    from: Joi.string().required(),
    text: Joi.string().required(),
    primary_entity_id: Joi.string().required(),
}).options({allowUnknown: true})


