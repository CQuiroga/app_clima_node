const fs = require('fs');
const axios = require('axios');

class Busquedas {
    historial = [];
    dbpath = './db/database.json';
    
    constructor() {
        this.leerDB();
    }

    get historialCapitalizado() {

        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ')
        });
    }

    get paramsMapBox() {
        return {
            'proximity': 'ip',
            'language': 'es',
            'limit': 5,
            'access_token': process.env.MAPBOX_KEY
        }
    }

    get paramsOpenWeather() {
        return {
            'lang': 'es',
            'units': 'metric',
            'appid': process.env.OPENWEATHER_KEY
        }
    }

    async ciudad ( lugar = '') {
        
        try {
            //petición http
            
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapBox
            });

            const resp = await instance.get();
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0], 
                lat: lugar.center[1]
            }));
    
            
        } catch (error) {
            console.log('Error');
            return [];
        }
    }

    async climaLugar(lat, lon) {
        try {
            //petición http
            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            });

            const resp = await instance.get();
            const {weather, main} = resp.data;

            return {
                    descripcion: weather[0].description,
                    temperatura: main.temp,
                    temp_max: main.temp_max,
                    temp_min: main.temp_min, 
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial( lugar = '') {
        if(this.historial.includes( lugar.toLowerCase() )) {
            return;
        }
        this.historial = this.historial.splice(0,9);
        this.historial.unshift( lugar.toLowerCase() );
        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync( this.dbpath, JSON.stringify( payload ));
    }

    leerDB() {
        if (!fs.existsSync( this.dbpath )) return;

        const info = fs.readFileSync( this.dbpath, { encoding: 'utf-8'});
        const data = JSON.parse( info );

        this.historial = data.historial;
    }
}

module.exports = Busquedas;