require('dotenv').config();

const colors = require('colors');
const { inquirerMenu, pausa, leerInput, 
    confirmar, mostrarListadoCheckList, listarLugares} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async()=> {

    const busquedas = new Busquedas();
    let opt = 0;

        do {
            opt = await inquirerMenu();   

            switch (opt) {
                case 1:
                    // mostrar mensaje
                    const busqueda = await leerInput('Ciudad a consultar: ');

                    // buscar lugar
                    const lugares = await busquedas.ciudad( busqueda );

                    // seleccionar lugar
                    const id = await listarLugares( lugares );
                    if (id === '0') continue;
                    
                    const lugarSel = lugares.find( l => l.id === id );

                    // Guardar db
                    busquedas.agregarHistorial(lugarSel.nombre)

                    // Clima
                    const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng );

                    // Mostrar resultados
                    console.log(colors.cyan('\n ============ Información de la ciudad =============\n'));
                    console.log(colors.blue('ciudad: ', lugarSel.nombre));
                    console.log(colors.gray('Lalitud: ', lugarSel.lat));
                    console.log(colors.magenta('Longitud: ', lugarSel.lng));
                    console.log(colors.yellow('Estado Clima: ', clima.descripcion));
                    console.log(colors.yellow('Tempetarura: ', clima.temperatura));
                    console.log(colors.red('Tem Mínima: ', clima.temp_min));
                    console.log(colors.white.underline('Temp Máxima: ', clima.temp_max));

                    break;
                case 2:
                    busquedas.historialCapitalizado.forEach( (lugar, i) => {
                        const idx = `${ i+1 }`;
                        console.log( `${ idx } ${ lugar }`);
                    });

                    break;
            }   

            if ( opt !== 3 ) await pausa();
        } while (opt != 3);

}

main();