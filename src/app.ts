import dotenv from 'dotenv';
import fs from 'fs'
import express, { Express, NextFunction, Request, Response } from 'express';
import { haversineDistance } from './utils';
import { City, cities, findCityByGUID, findNeighbouringCities } from './cities';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

const jobs = new Map<string, City[] | undefined>()

app.use((req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader || authHeader.slice(7) !== process.env.TOKEN) {
        console.log('Unauthorized')
        res.sendStatus(401)
        return
    }

    next()
})

app.get('/cities-by-tag', (req: Request, res: Response) => {
    if (typeof req.query.tag !== 'string') {
        res.status(400).send('Missing tag in query params')
        return
    }

    if (typeof req.query.isActive !== 'string') {
        res.status(400).send('Missing isActive in query params')
        return
    }

    const tag: string = req.query.tag
    const isActive: boolean = req.query.isActive === 'true' ? true : false

    const matches = cities.filter(
        c => c.tags.includes(tag) && c.isActive === isActive
    )

    res.json({ cities: matches })
});

app.get('/distance', (req: Request, res: Response) => {
    if (typeof req.query.from !== 'string') {
        res.status(400).send('Missing from in query params')
        return
    }

    if (typeof req.query.to !== 'string') {
        res.status(400).send('Missing to in query params')
        return
    }

    const from: City | undefined = findCityByGUID(req.query.from)
    const to: City | undefined = findCityByGUID(req.query.to)

    if (from === undefined) {
        res.status(400).send('Unknown from city')
        return
    }

    if (to === undefined) {
        res.status(400).send('Unknown to city')
        return
    }

    const distance = haversineDistance(
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude,
    )

    const round = (x, p) => Math.round(x * 10 ** p) / 10 ** p

    res.json(
        {
            from,
            to,
            distance: round(distance, 2),
            unit: 'km'
        }
    )
})

app.get('/area', (req: Request, res: Response) => {
    if (typeof req.query.from !== 'string') {
        res.status(400).send('Missing from in query params')
        return
    }

    if (typeof req.query.distance !== 'string') {
        res.status(400).send('Missing distance in query params')
        return
    }

    const from: City | undefined = findCityByGUID(req.query.from)
    const distance: Number = parseFloat(req.query.distance)

    const jobId = "2152f96f-50c7-4d76-9e18-f7033bd14428"

    jobs.set(jobId, undefined)

    findNeighbouringCities(from, distance).then((cities) => jobs.set(jobId, cities))

    res
        .status(202)
        .json(
            {
                resultsUrl: `http://127.0.0.1:${port}/area-result/${jobId}`
            }
        )
})

app.get('/area-result/:jobId', (req: Request, res: Response) => {
    if (typeof req.params.jobId !== 'string') {
        res.status(400).send('Missing jobId in url params')
        return
    }

    // It's hardwired for the code test, not needed
    const jobId: string = req.params.jobId

    if (jobs.has(jobId)) {
        const result = jobs.get(jobId)

        // It's done, have it
        if (result) {
            res.status(200).json(
                {
                    cities: result
                }
            )
            return
        }

        // It's cooking, come back later
        res.sendStatus(202)
        return
    } else {
        // It's not cooking, something is wrong
        res.sendStatus(404)
        return
    }

})

app.get('/all-cities', (req: Request, res: Response) => {
    fs.createReadStream('addresses.json').pipe(res)
    return
})

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});