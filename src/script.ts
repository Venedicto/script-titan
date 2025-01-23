import xlsx from "xlsx";
import path from "node:path";
import pg from "pg";
import GoogleMapService from "./GoogleMap";
const { Client } = pg;
const dbConnectionString =
	"postgresql://postgres:PcslsggIrqeRlxHqGJXlKPvLsHYpWwgi@junction.proxy.rlwy.net:23442/railway";

const googleMapService = new GoogleMapService(
	process.env.GOOGLE_MAPS_TOKEN ?? "",
);
interface IPl {
	__rowNum__: number;
	Permiso: string;
	"Razón social": string;
	"Estacion de Servicio": string;
	Domicilio: string;
	Colonia: string;
	CP: string;
	Municipio: string;
	Estado: string;
}

const getPLByPermiso = async (permiso: string) => {
	const client = new Client(dbConnectionString);
	await client.connect();
	const query = `SELECT * FROM "public"."Subjects" WHERE "pl"::TEXT LIKE '%${permiso}%' ORDER BY "id"`;
	const result = await client.query(query);
	await client.end();
	return result.rows[0];
};

const readExcel = (filePath: string): IPl[] => {
	const workbook = xlsx.readFile(filePath);
	const sheetName = workbook.SheetNames[0];
	const sheet = workbook.Sheets[sheetName];
	const data = xlsx.utils.sheet_to_json<IPl>(sheet);
	return data;
};

const updatePL = async (pl: IPl, id: number) => {
	const fullAddress = `${pl.Domicilio}, ${pl.Colonia}, ${pl.Municipio}, ${pl.Estado}, ${pl.CP}`;
	const latLng = await googleMapService.getLatLng(fullAddress);
	const client = new Client(dbConnectionString);
	await client.connect();
	const query = `UPDATE "public"."Subjects" SET "pl" = '${pl.Permiso}', "socialReason" = '${pl["Razón social"]}', "address" = '${pl.Domicilio}', "municipality" = '${pl.Municipio}', "state" = '${pl.Estado}', "postalCode" = '${pl.CP}', "city" = '${pl.Colonia}', "lat" = ${latLng?.lat ?? 0}, "lng" = ${latLng?.lng ?? 0}, "brand" = ' ', "group" = ' ' WHERE "id" = ${id}`;
	const result = await client.query(query);
	await client.end();
	return result.rows[0];
};

const main = async () => {
	const filePath = path.resolve(__dirname, "./data/pls.xlsx");
	const data = readExcel(filePath);

	for (const pl of data) {
		console.log("Searching for", pl.Permiso);
		const exist = await getPLByPermiso(pl.Permiso);
		console.log("Found", exist);

		if (exist) {
			console.log("Updating", pl.Permiso);
			const updated = await updatePL(pl, exist.id);
			console.log("Updated");
		}
	}
};

main();
