import fs from 'fs'
import { haversineDistance } from './utils'

export interface City {
    guid: string
    isActive: boolean,
    address: string,
    latitude: number,
    longitude: number,
    tags: string[]
}

export let cities: City[]
try {
    cities = JSON.parse(fs.readFileSync('addresses.json').toString())
} catch (error) {
    console.error("Failed to read and parse cities")
    process.exit(1)
}


export const findCityByGUID = guid => cities.find(c => c.guid === guid)

export const findNeighbouringCities = (from: City, maxDistance: Number) => new Promise<City[]>((resolve, reject) => {
    process.nextTick(() => {
        const neighbours: City[] = []

        for (let i = 0; i < cities.length; i++) {
            const c1 = cities[i];

            if (c1 === from) {
                continue
            }

            const distance = haversineDistance(
                from.latitude,
                from.longitude,
                c1.latitude,
                c1.longitude
            )

            if (distance <= maxDistance) {
                neighbours.push(c1)
            }
        }

        resolve(neighbours)

    })
})