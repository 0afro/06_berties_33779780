// Create a new router
const express = require("express")
const router = express.Router()
const request = require("request");
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./users/login')
    } else {
        next()
    }
}

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
})

// Weather form
router.get('/weather', function (req, res) {
    res.send(`
        <form method="POST" action="/weather">
            <input name="city" placeholder="Enter city" required>
            <button>Check Weather</button>
        </form>
    `);
});

// Weather result handler
router.post('/weather', function (req, res, next) {
    let city = req.body.city;
    let apiKey = process.env.WEATHER_KEY;


    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        if (err) return next(err);

        let weather = JSON.parse(body);

        if (weather && weather.main) {
            let msg = `
                <h2>Weather in ${weather.name}</h2>
                Temperature: ${weather.main.temp}°C <br>
                Humidity: ${weather.main.humidity}% <br>
                Wind: ${weather.wind.speed} m/s <br><br>
                <a href="/weather">Check another city</a>
            `;
            res.send(msg);
        } else {
            res.send("No data found — check the city name.");
        }
    });
});


// Export the router object so index.js can access it
module.exports = router