import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "pg";
import fs from "node:fs/promises";
import GoogleMap from "./GoogleMap";

const { Client } = pkg;
const dbConnectionString =
	"postgresql://postgres:PcslsggIrqeRlxHqGJXlKPvLsHYpWwgi@junction.proxy.rlwy.net:23442/railway";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFilePath = path.join(__dirname, "../data/padron_formateado.txt");

const readExcelFile = async (filePath) => {
	try {
		// Leer el archivo
		const data = await fs.readFile(filePath, "utf8");

		//separar el contenido por lineas

		const line = data.split("\n");

		// Separar el contenido por comas
		//const datosSeparados = data.split(',');
		const datosSeparados = line.map((line) => line.split(","));

		// Imprimir los datos separados
		return datosSeparados;
	} catch (err) {
		console.error("Error al leer el archivo:", err);
	}
};

const prepareData = (data) => {
	return data.map((row) => {
		console.log(row);
		// const pl = row[0].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const item = row[1].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const type = row[2].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const socialReason = row[3].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const brand = row[4].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const group = row[5].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const address = row[6].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const city = row[7].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const postalCode = row[8].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const state = row[9].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const municipality = row[10].replace(/(\r\n|\n|\r)/gm, "").trim();
		// const subjectId = pl.includes("PL/") ? pl.split("/")[1] : "";

		const pl = row[0].replace(/(\r\n|\n|\r)/gm, "").trim();
		const item = row[1].replace(/(\r\n|\n|\r)/gm, "").trim();

		// removes " and trim
		const socialReason = row[2]
			.replace(/(\r\n|\n|\r)/gm, "")
			.replace(/"/g, "")
			.trim();

		const socialReason2 = row[3]
			.replace(/(\r\n|\n|\r)/gm, "")
			.replace(/"/g, "");

		const address = row[4].replace(/(\r\n|\n|\r)/gm, "").replace(/"/g, "");
		const colonia = row[5]
			.replace(/(\r\n|\n|\r)/gm, "")
			.replace(/"/g, "")
			.replace(/COL\./g, "");
		const cp = row[6]
			.replace(/(\r\n|\n|\r)/gm, "")
			.replace(/"/g, "")
			.replace(/Codigo Postal|C\. P\./g, "");
		const row7 = row[7].replace(/(\r\n|\n|\r)/gm, "").replace(/"/g, "");
		const row8 = row[8].replace(/(\r\n|\n|\r)/gm, "").replace(/"/g, "");

		console.log("PL", pl);
		console.log("item", item);
		console.log("socialReason", socialReason);
		console.log("socialReason2", socialReason2);
		console.log("AD", address);
		console.log("COL", colonia);
		console.log("CP", cp);
		console.log("row7", row7);
		console.log("row8", row8);
		// console.log("PL", pl);
		// console.log("item", item);
		// console.log("type", type);
		// console.log("socialReason", socialReason);
		// console.log("brand", brand);
		// console.log("group", group);
		// console.log("address", address);
		// console.log("city", city);
		// console.log("postalCode", postalCode);
		// console.log("state", state);
		// console.log("municipality", municipality);
	});
};

const insertDataToPostgres = async (data) => {
	const client = new Client({
		connectionString: dbConnectionString,
	});

	try {
		await client.connect();

		for (const row of data) {
			console.log(row);
			console.log("ingresando pl", row.pl);
			console.log(row);
			await client.query(
				`
                    INSERT INTO "Subjects" (pl, type, "socialReason", brand, "group", "subjectId", neo, mp, address, city, "postalCode", state, municipality)
                    VALUES 
                    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13);
            `,
				[
					row.pl,
					row.type,
					row.socialReason,
					row.brand,
					row.group,
					row.subjectId,
					row.neo,
					row.mp,
					row.address,
					row.city,
					row.postalCode,
					row.state,
					row.municipality,
				],
			);
			console.log("se agrego el pl");
		}

		console.log("Proceso exitoso.");
	} catch (error) {
		console.error("Error al insertar data", error);
	} finally {
		await client.end();
	}
};

const getAllSubjects = async () => {
	const client = new Client({
		connectionString: dbConnectionString,
	});

	try {
		await client.connect();
		const result = await client.query(
			'SELECT * FROM "public"."Subjects" ORDER BY "id"',
		);
		console.log(result.rows);
		return result.rows;
	} catch (error) {
		console.error("Error al obtener los datos", error);
	} finally {
		await client.end();
	}
};

const getSubjectById = async (id) => {
	const client = new Client({
		connectionString: dbConnectionString,
	});

	try {
		await client.connect();
		const result = await client.query(
			`SELECT * FROM "public"."Subjects" WHERE "id" = $1`,
			[id],
		);
		return result.rows;
	} catch (error) {
		console.error("Error al obtener los datos", error);
	} finally {
		await client.end();
	}
};

const main = async () => {
	const excelData = await readExcelFile(excelFilePath);
	// console.log(excelData)
	const preparedData = prepareData(excelData);
	// console.log(preparedData);
	// await insertDataToPostgres(preparedData);
};

main();
