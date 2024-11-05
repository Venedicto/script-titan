import xlsx from 'xlsx';
//import { Client } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import fs from "fs/promises"


const { Client } = pkg;



const dbConnectionString = 'postgresql://postgres:MuXbouQYXoElGUtJSwUcGjYujBZiImza@autorack.proxy.rlwy.net:29904/railway';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFilePath = path.join(__dirname, '../data/PL_separated_by_comma_updated.txt');


const readExcelFile = async (filePath) => {
    try {
        // Leer el archivo
        const data = await fs.readFile(filePath, 'utf8');
        
        // Separar el contenido por comas
        const datosSeparados = data.split(',');

        // Imprimir los datos separados
        return datosSeparados
    } catch (err) {
        console.error('Error al leer el archivo:', err);
    }

};


const prepareData = (data) => {
   
    return data.map(row => {
       
        const item = row.replace(/(\r\n|\n|\r)/gm, "").trim()
        const subjectId = item.includes('PL/') ? item.split("/")[1] : ""
      
   
        return {
            pl: item,
            type: "",
            socialReason: "",
            brand: "",
            group: "",
            subjectId: subjectId,
            neo: "",
            mp: "",
            address: "",
            city: "",
            postalCode: "",
            state: "",
            municipality: ""
        };
    });
   
};


const insertDataToPostgres = async (data) => {
    const client = new Client({
        connectionString: dbConnectionString,
    });

    try {

        await client.connect();

        for (const row of data) {
            console.log("Ingresando Data", row.pl)
            await client.query(`
                    INSERT INTO "Subjects" (pl, type, "socialReason", brand, "group", "subjectId", neo, mp, address, city, "postalCode", state, municipality)
                    VALUES 
                    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13);
            `, [
                row.pl, row.type, row.socialReason, row.brand, row.group, row.subjectId,
                row.neo, row.mp, row.address, row.city, row.postalCode, row.state, row.municipality
            ]);
            console.log("se agrego el pl")
        }

        console.log("Proceso exitoso.");
    } catch (error) {
        console.error("Error al insertar data", error);
    } finally {
        await client.end();
    }
};


const main = async () => {
    
    const excelData = await readExcelFile(excelFilePath);
    console.log(excelData)
    const preparedData = prepareData(excelData);
    await insertDataToPostgres(preparedData);
};

main();
