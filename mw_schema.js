const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Stocks')
    .then(() => {
        console.log("Connected!!")
    })
    .catch((e) => {
        console.log("Error")
    })


const OHLC = new mongoose.Schema({
    Date: String,
    Open: Number,
    High: Number,
    Low: Number,
    Close: Number,
    Volume: Number

})

const historicalSchema = new mongoose.Schema({
    Symbol: String,
    Exchange: String,
    Data: [
        OHLC
    ]
});

const price = mongoose.model('price', historicalSchema, 'alldata');


module.exports.price = price

const get_data = async () => {



    let tickers = await price.find({}, { Symbol: 1, _id: 0 })
    let sym = []
    for (let t of tickers) {
        sym.push(t.Symbol)
    }

    return sym


}



module.exports.get_data = get_data