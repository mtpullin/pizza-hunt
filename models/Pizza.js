const {Schema, model} = require('mongoose')

const PizzaSchema = new Schema({
    pizzaName: {
        type: String
    },
    createdBy: {
        type: String
    },
    createdAt: {
        type: Date,
        dfault: Date.now
    },
    size: {
        type: String,
        default: 'Large'
    },
    toppings: []
});

//create the Pizza model using the pizzaschema
const Pizza = model('Pizza', PizzaSchema)

//export puzza model
module.exports = Pizza;