export function haversineDistance(lat1, lon1, lat2, lon2, R = 6371) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }

    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;

    const dlat = radlat2 - radlat1

    const radlon1 = Math.PI * lon1 / 180;
    const radlon2 = Math.PI * lon2 / 180;

    const dlon = radlon2 - radlon1

    const a = (Math.sin(dlat / 2)) ** 2 + Math.cos(radlat1) * Math.cos(radlat2) * (Math.sin(dlon / 2)) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
}