import { Client } from "@googlemaps/google-maps-services-js";
interface Location {
	lat: number;
	lng: number;
}
export default class GoogleMap {
	client: Client;
	token: string;
	constructor(token: string) {
		this.client = new Client({});
		this.token = token;
	}

	private async gecodingAddress(address: string) {
		const geocode = await this.client.geocode({
			params: {
				address,
				key: this.token,
			},
		});

		if (!geocode.data.results[0]) return null;

		return geocode.data.results[0].geometry.location;
	}

	public getLatLng(address: string) {
		return this.gecodingAddress(address).then((data) => {
			if (data) {
				return {
					lat: data.lat,
					lng: data.lng,
				};
			}
			return null;
		});
	}
}
