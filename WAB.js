import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";

const wapp = express();
const port = 3000;

wapp.use(bodyParser.json());
wapp.use(cors());

const daylist = ["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"];

const wcode = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast", 
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Drizzle: Light Intensity",
    53: "Drizzle: Moderate Intensity",
    55:	"Drizzle: Dense Intensity",
    56: "Freezing Drizzle: Light Intensity",
    57:	"Freezing Drizzle: Dense Intensity",
    61: "Rain: Slight Intensity",
    63: "Rain: Moderate Intensity",
    65:	"Rain: Heavy Intensity",
    66: "Freezing Rain: Slight Intensity",
    67:	"Freezing Rain: Heavy Intensity",
    71: "Snow Fall: Slight Intensity",
    73: "Snow Fall: Moderate Intensity",
    75:	"Snow Fall: Heavy Intensity",
    77: "Snow Grains",
    80: "Rain Showers: Slight Intensity",
    81: "Rain Showers: Moderate Intensity",
    82:	"Rain Showers: Violent Intensity",
    85: "Slight Snow Showers",
    86: "Slight Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail"
};

var file = {};


wapp.get("/", async (req, res)=>{
    try{
        const response = (await axios.get("https://api.open-meteo.com/v1/forecast?latitude=28.6138954&longitude=77.2090057&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration&past_hours=1&forecast_hours=1")).data;
        const aqi = (await axios.get("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.58&longitude=77.33&current=european_aqi&domains=cams_global")).data;

        const date = new Date().getDay();
        var color;
        var bimage;


        if (response.current.is_day==1){
            color = "black";
            bimage = "ClearSky.jpg";
        }
        else{
            color = "white";
            bimage = "ClearNight.jpg";
        }

        file = {
            city:"New Delhi District",
            state:"Delhi",
            country: "India",
            temp: response.current.temperature_2m,
            wc: wcode[response.current.weather_code],
            rh: response.current.relative_humidity_2m,
            at: response.current.apparent_temperature,
            ws: response.current.wind_speed_10m,
            wd: response.current.wind_direction_10m,
            wg: response.current.wind_gusts_10m,
            date: date,
            daylist: daylist,
            mintemp: response.daily.temperature_2m_min,
            maxtemp: response.daily.temperature_2m_max,
            sunrise: response.daily.sunrise,
            sunset: response.daily.sunset,
            daydur: response.daily.daylight_duration,
            color: color,
            bimage: bimage,
            aqi: aqi.current.european_aqi
        };
        
        res.send(file);
    } catch (error){
        console.log(error.message);
    }
});

wapp.get("/search", (req, res)=>{
    res.redirect("/");
});

wapp.post("/search", async (req, res)=>{
    try{
        const name = req.body.city;
        const suggest = (await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${name}&lang=en&limit=1&type=city&format=json&apiKey=569524806a944ea688186b38cdc15ae0`)).data;
        
        const long = suggest.results[0].lon;
        const lat = suggest.results[0].lat;

        const curr = (await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration&past_hours=1&forecast_hours=1`)).data;
        const aqi = (await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${long}&current=european_aqi&domains=cams_global`)).data;

        const date = new Date().getDay();
        var color;
        var bimage;

        if (curr.current.is_day==1){
            color = "black";
            bimage = "ClearSky.jpg";
        }
        else{
            color = "white";
            bimage = "ClearNight.jpg";
        }

        file = {
            city: suggest.results[0].city,
            state: suggest.results[0].state,
            country: suggest.results[0].country,
            temp: curr.current.temperature_2m,
            wc: wcode[curr.current.weather_code],
            rh: curr.current.relative_humidity_2m,
            at: curr.current.apparent_temperature,
            ws: curr.current.wind_speed_10m,
            wd: curr.current.wind_direction_10m,
            wg: curr.current.wind_gusts_10m,
            date: date,
            daylist: daylist,
            mintemp: curr.daily.temperature_2m_min,
            maxtemp: curr.daily.temperature_2m_max,
            sunrise: curr.daily.sunrise,
            sunset: curr.daily.sunset,
            daydur: curr.daily.daylight_duration,
            color: color,
            bimage: bimage,
            aqi: aqi.current.european_aqi
        };

        res.send(file);
    
    } catch (error){
        console.log(error.message);
    }
});

wapp.listen(port, ()=>{
    console.log(`We are Live at Port ${port}!`);
});