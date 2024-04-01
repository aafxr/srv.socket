import Joi from "joi";

export const joinSchema = Joi.object({
    travelID: Joi.string().required()
})

export const leaveSchema = joinSchema


export const travelActionSchema = Joi.object({
    entity: Joi.string().required().equal("Travel"),
    data: Joi.object(
        {
            id: Joi.string().required()
        }
    ).options({allowUnknown: true}).required()
}).options({allowUnknown: true})


export const expenseActionSchema = Joi.object({
    entity: Joi.string().pattern(new RegExp('^expense')).required(),
    data: Joi.object(
        {
            id: Joi.string().required(),
            primary_entity_id: Joi.string().required()
        }
    ).options({allowUnknown: true})
}).options({allowUnknown: true})


export const limitActionSchema = Joi.object({
    entity: Joi.string().equal('Limit').required(),
    data: Joi.object(
        {
            id: Joi.string().required(),
            primary_entity_id: Joi.string().required()
        }
    ).options({allowUnknown: true})
}).options({allowUnknown: true})


export const messageSchema = Joi.object({
    date: Joi.string().required(),
    from: Joi.string().required(),
    text: Joi.string().required(),
    primary_entity_id: Joi.string().required(),
}).options({allowUnknown: true})


