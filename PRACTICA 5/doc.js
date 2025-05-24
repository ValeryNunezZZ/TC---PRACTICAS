let validez = false;

let archivoSeleccionado = false;
/*
class AFD{
    constructor(estados, alfabeto, transiciones, estadosFinales, estadoInicial){
        this.estados = estados;
        this.alfabeto = alfabeto;
        this.transiciones = transiciones;
        this.estadosFinales = estadosFinales;
        this.estadoInicial = estadoInicial;
    }

    convertir(){

    }
}
*/
let renglones = [];

document.getElementById("file-upload").addEventListener("change",

(event) =>{


    const archivo = event.target.files[0]; 

    if (archivo) {

        const lector = new FileReader();

        lector.onload = function(e) {
            document.getElementById("contenidoArchivo").textContent = e.target.result;

            let i=0;

            e.target.result.split("\n").forEach(renglon => {
                renglones[i] = renglon;
                i++;
            });

            crearAutomata();
        };

        lector.readAsText(archivo);
        archivoSeleccionado = true;

        alert("Se ha seleccionado correctamente un archivo :D")
    } else {
        alert("No se seleccionó ningún archivo.");
        archivoSeleccionado = false;
    }
});


//RENGLONES DEL ARCHIVO

let estados = [];
let estadoInicial;
let estadosFinales = [];
let alfabeto = [];
let transiciones = {};


function crearAutomata(){
    
    renglones[0].split(" ").map(s => s.trim()).forEach(c => {
        estados.push(c);
    });

    estadoInicial = renglones[1];

    renglones[2].split(" ").map(s => s.trim()).forEach(c => {
        estadosFinales.push(c);
    });
    
    console.log("Estado finales = " + estadosFinales);
    renglones[3].split(" ").map(s => s.trim()).forEach(c => {
        alfabeto.push(c);
    });

    alfabeto.push("ep");

    for(let i=0 ; i<estados.length ; i++){

        let j = 0;
        transiciones[estados[i]] = {};
    
        //;renglones[i+4].split(" ")
        renglones[i+4].split(" ").map(s => s.trim()).forEach(c => {
            
            let letra = alfabeto[j];
            let aux = c.split(",").map(s => s.trim());

            if(aux != '-') transiciones[estados[i]][letra] = aux;
            else transiciones[estados[i]][letra] = [];

            j++;
        });
    
    }

    console.log(transiciones);
    conversionAFD();
}

function conversionAFD(){

    let nuevosEstados = {};
    let ftAFD = {};
    let queue = [];
    let aux = estadoInicial.split(",").map(s => s.trim());

    queue.push(aux);

    let contadorDeNuevosEstados = 0;

    while(queue.length != 0){

        let estado = queue.shift();
        let estadosEpsilon = new Set();
        let arrEstadosEpsilon = [];

        arrEstadosEpsilon.push(...estado);
        //Segundo se deben de añadir los estados epsilon de CADA ESTADO BASE

        console.log(arrEstadosEpsilon);
        //Primero se deben de añadir los estados base

        estado.forEach((element)=>{
            estadosEpsilon.add(element);
        })

        console.log(estadosEpsilon);

        /*for(let i=0 ; i<arrEstadosEpsilon.length ; i++){

            for(value of transiciones[arrEstadosEpsilon[i]]["ep"]){
                if(!estadosEpsilon.has(value)){
                    estadosEpsilon.add(value);
                    console.log("VALOR PROBLEMA" + value);
                    arrEstadosEpsilon.push(value);
                }
                
            }
            
        }        */

        
        for (let i = 0; i < arrEstadosEpsilon.length; i++) {
            const es = arrEstadosEpsilon[i];

            if (transiciones[es]?.ep) {
                
                for (const value of transiciones[es].ep) {
                
                    if (!estadosEpsilon.has(value)) {
                        estadosEpsilon.add(value);
                        arrEstadosEpsilon.push(value);
                    }
                }
            }
        }


        let estadoArr = estado.sort().join(",");
        let strArr = arrEstadosEpsilon.sort().join(",");

        //CALCULO DE LOS ARREGLOS DEL ALFABETO

        for(j=0 ; j<alfabeto.length-1 ; j++){
            
            let estadosAlfabeto = new Set();

            for(let i=0 ; i<arrEstadosEpsilon.length ; i++){
                for(value of transiciones[`${arrEstadosEpsilon[i]}`][`${alfabeto[j]}`]){
                    estadosAlfabeto.add(value);
                }
            }

            if (!ftAFD[estadoArr]) {
                ftAFD[estadoArr] = {};
            }

            ftAFD[estadoArr][alfabeto[j]] = [...estadosAlfabeto];

            let strArrAlfabeto = [...estadosAlfabeto].sort().join(",");

            if(`${strArrAlfabeto}` in nuevosEstados){}else{
                queue.push([...estadosAlfabeto]);
                nuevosEstados[`${strArrAlfabeto}`] = contadorDeNuevosEstados;
                contadorDeNuevosEstados++;
            }
        }

        ftAFD[estadoArr]["ep"] = arrEstadosEpsilon;

        //si no existe ya el arreglo        
        if(`${estadoArr}` in nuevosEstados){}else{
            queue.push(arrEstadosEpsilon);
            nuevosEstados[`${estadoArr}`] = contadorDeNuevosEstados;
            contadorDeNuevosEstados++;
        }

        if(`${strArr}` in nuevosEstados){}else{
            queue.push(arrEstadosEpsilon);
            nuevosEstados[`${strArr}`] = contadorDeNuevosEstados;
            contadorDeNuevosEstados++;
        }
        

    }

    console.log("NUEVOS ESTADOS");
    console.log(nuevosEstados);
    console.log("nueva matriz")
    console.log(ftAFD);


    impresionAFD(reescrituraDeFuncion(nuevosEstados, ftAFD), nuevosEstados, aux, contadorDeNuevosEstados);
}

function reescrituraDeFuncion(nuevosEstados, ftAFD){

    let funcTranFinal = {};

    for(clave in ftAFD){

        let nuevaClavePadre = nuevosEstados[clave];

        if (!funcTranFinal[nuevaClavePadre]) {
            funcTranFinal[nuevaClavePadre] = {};
        }

        for(claveS in ftAFD[clave]){

            let nuevaClaveHijo = nuevosEstados[ftAFD[clave][claveS].join(',')];

            funcTranFinal[nuevaClavePadre][claveS] = nuevaClaveHijo;
        }
        

    }

    return funcTranFinal;

}

function obtencionEstadosFinales(nuevosEstados){

    let nuevosEstadosFinales = new Set();

    for(value of estadosFinales){
        for(clave in nuevosEstados){    
            console.log("VALUE = " + value);
            console.log("CLAVE = " + clave);
            if(clave.includes(value)){
                nuevosEstadosFinales.add(nuevosEstados[clave]);
            }
        }
    }

    let arrEF = [...nuevosEstadosFinales];

    return arrEF;
}



function descargarArchivo(cConEspacios, ei, nuevosEstados, trans) {
    // Contenido del archivo
    let contenido = "";

    contenido = `${cConEspacios}\n`
    contenido += `${ei}\n`;
    contenido += `${obtencionEstadosFinales(nuevosEstados).join(' ')}\n`;
    contenido += `${alfabeto.join(' ')}\n`;
    contenido += `${trans}`;

    //Transiciones



    // Crear un Blob con el contenido
    const blob = new Blob([contenido], { type: 'text/plain' });

    // Crear un enlace temporal
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = "archivo.txt"; // Nombre del archivo

    // Simular clic en el enlace
    enlace.click();

    // Liberar el objeto URL
    URL.revokeObjectURL(enlace.href);
}




function impresionAFD(funcTranFinal, nuevosEstados, aux, contadorDeNuevosEstados){

    let nuevosEstadosFinales = obtencionEstadosFinales(nuevosEstados).join(', ');

    let tablaHTML = "";


    //estados
    let c = "";
    let cConEspacios = "";

    for(let i=0 ; i<=contadorDeNuevosEstados ; i++){
        if(i!=contadorDeNuevosEstados) c += `${i}, `
        else c += `${i}`

        cConEspacios += `${i} `;
    }

    tablaHTML += `<p><b>Estados:</b> ${c}</p><br>`;
    tablaHTML += `<p><b>Estado Inicial:</b> ${nuevosEstados[aux]}</p><br>`;
    tablaHTML += `<p><b>Estados Finales:</b> ${nuevosEstadosFinales}</p><br>`;
    tablaHTML += `<p><b>Alfabeto:</b> ${alfabeto.join(', ')}</p><br>`;

    //alfabeto

    tablaHTML += "<table border='1'><thead><tr><th>Estado</th>";

    // Obtener los encabezados únicos de las columnas
    const columnas = new Set();

    for (const estado in funcTranFinal) {
        for (const simbolo in funcTranFinal[estado]) {
            columnas.add(simbolo);
        }
    }
    
    // Convertimos Set a Array para usarlo ordenadamente
    const columnasOrdenadas = [...columnas].sort();
    
    // Añadir encabezados de columna
    for (const col of columnasOrdenadas) {
        tablaHTML += `<th>${col}</th>`;
    }

    let trans = "";

    tablaHTML += "</tr></thead><tbody>";
    
    // Llenar la tabla con los datos
    for (const estado in funcTranFinal) {
        tablaHTML += `<tr><td>${estado}</td>`;

        for (const col of columnasOrdenadas) {
            const valor = funcTranFinal[estado][col];
            tablaHTML += `<td>${valor}</td>`;
            trans += `${valor} `;
        }

        tablaHTML += "</tr>";
        trans += `\n`;
    }
    
    tablaHTML += "</tbody></table>";

    document.querySelector(".palabraContainer").innerHTML = tablaHTML;

    descargarArchivo(cConEspacios, nuevosEstados[aux], nuevosEstados, trans);

}