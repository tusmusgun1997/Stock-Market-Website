const express = require('express');
const app = express();

const path = require('path');

const math = require('mathjs');

const { get_data, price } = require('./mw_schema.js')


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use(express.static('public'))




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



app.get('/', (req, res) => {
    res.render('finalhome');
})

app.get('/nifty50', async (req, res) => {

    const hist = await price.find({});

    res.render('home', { hist });

})

app.get('/stock', async (req, res) => {

    var { sym } = req.query;
    sym = sym.toUpperCase();


    if (sym) {
        let individual = await price.find({ Symbol: sym });
        res.render('individual.ejs', { individual });
        return;
    }

    res.send('Not a valid Search');


})

app.get('/stock/:symb/:days', async (req, res) => {

    var { symb, days } = await req.params;

    let individual = await price.find({ Symbol: symb });


    res.render('timeframe.ejs', { individual, days });

})

app.get('/indicators/sd', async (req, res) => {
    res.render('sdinput')
})

app.get('/indicators/sd/out', async (req, res) => {

    var factor = parseFloat(req.query.distance)
    var total = parseInt(req.query.total)
    var n = parseInt(req.query.n)




    var sym = await get_data()
    final = {}

    let pass = [];


    for (s of sym) {
        let closes = []
        let closes_object = await price.find({ Symbol: s }, { Data: 1, _id: 0 });

        for (let c of closes_object[0].Data) {
            closes.push(c.Close)

        }



        if (closes.length > total + n) {

            final[s] = closes;
            let len = closes.length;




            let std_array = []

            for (let i = 1; i < total; i++) {
                let std20 = dev(closes.slice(-i - n, -i));
                std_array.push(std20);
            }

            var minm = math.min(...std_array);



            if (std_array[0] < (factor * minm)) {
                pass.push(s);

            }





        }

    }
    res.render('std', { pass });

})

app.get('/indicators/cons', async (req, res) => {

    res.render('consinput')



})

app.get('/indicators/cons/out', async (req, res) => {

    var days = req.query.timefr
    var perc = (req.query.rang / 100)

    console.log(perc)




    var sym = await get_data()
    final = {}

    let pass = []

    for (let s of sym) {

        console.log(s)
        let high = []
        let low = []


        let data_object = await price.find({ Symbol: s }, { Data: 1, _id: 0 });
        let len = data_object[0].Data.length
        let required_data = data_object[0].Data.slice(len - days, len)


        for (let d of required_data) {

            high.push(d.High)

            low.push(d.Low)

        }

        var maxm = math.max(...high)
        var minm = math.min(...low)

        if (maxm <= ((1 + perc) * minm)) {
            pass.push(s)
        }
    }

    res.render('cons', { pass, days, perc })


})

app.get('/indicators/brk', async (req, res) => {

    res.render('brkinput')



})

app.get('/indicators/brk/out', async (req, res) => {

    var days = req.query.timefr

    var sym = await get_data()

    let pass = []

    for (let s of sym) {

        let closes = []

        let data_object = await price.find({ Symbol: s }, { Data: 1, _id: 0 });
        let len = data_object[0].Data.length
        let required_data = data_object[0].Data.slice(len - days, len)

        for (let d of required_data) {

            closes.push(d.Close)

        }

        var maxm = math.max(...closes)

        if (maxm === closes[closes.length - 1]) {
            pass.push(s)
        }

    }

    res.render('brk', { pass, days })





})



app.listen(3000, () => {
    console.log("started");
})
