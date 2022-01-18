const math = require('mathjs');

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

function dev(arr) {

    let mean = arr.reduce((acc, curr) => {
        return acc + curr
    }, 0) / arr.length;


    arr = arr.map((k) => {
        return (k - mean) ** 2
    })


    let sum = arr.reduce((acc, curr) => acc + curr, 0);


    let variance = sum / arr.length

    return Math.sqrt(sum / arr.length)
}

const tickers = async () => {

    let tickers = await price.find({}, { Symbol: 1, _id: 0 })
    let sym = []
    for (let t of tickers) {
        sym.push(t.Symbol)
    }

    days = 15
    perc = 1.07
    let high = []
    let low = []


    let data_object = await price.find({ Symbol: 'EMAMIPAP' }, { Data: 1, _id: 0 });
    let len = data_object[0].Data.length
    let required_data = data_object[0].Data.slice(len - days, len)

    for (let d of required_data) {
        high.push(d.High)
        console.log(d.Date)

        low.push(d.Low)

    }

    var maxm = math.min(...high)
    var minm = math.min(...low)

    if (maxm <= ((1 + perc) * minm)) {
        console.log("yes")
    }





}

tickers()

