import xlsx from 'xlsx';
//import { Client } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';


const { Client } = pkg;



const dbConnectionString = 'postgresql://postgres:PcslsggIrqeRlxHqGJXlKPvLsHYpWwgi@junction.proxy.rlwy.net:23442/railway';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFilePath = path.join(__dirname, '../data/PL_2000.xlsx');


const readExcelFile = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
};


const prepareData = (data) => {
    return data.map(row => {
        const plValue = row.PL || '';
        const subjectId = plValue.includes('PL/') ? plValue.split('PL/')[1] : null;

        return {
            pl: plValue,
            type: null,
            socialReason: null,
            brand: null,
            group: null,
            subjectId: subjectId,
            neo: null,
            mp: null,
            address: null,
            city: null,
            postalCode: null,
            state: null,
            municipality: null
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
            await client.query(`
                INSERT INTO table_name (pl, type, socialReason, brand, "group", subjectId, neo, mp, address, city, postalCode, state, municipality)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                row.pl, row.type, row.socialReason, row.brand, row.group, row.subjectId,
                row.neo, row.mp, row.address, row.city, row.postalCode, row.state, row.municipality
            ]);
        }

        console.log("Proceso exitoso.");
    } catch (error) {
        console.error("Error al insertar data", error);
    } finally {
        await client.end();
    }
};


const main = async () => {
    const excelData = readExcelFile(excelFilePath);
    const preparedData = prepareData(excelData);
    await insertDataToPostgres(preparedData);
};

main();
