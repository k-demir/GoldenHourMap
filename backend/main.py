import numpy as np
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from pysolar import solar
from datetime import datetime, timezone, timedelta
from os.path import join, isfile
from pyproj import Transformer

MAP_IMAGES = './resources/map_images'
HEIGHTMAP_IMAGES = './resources/heightmaps'

app = FastAPI()

to_wgs84_transformer = Transformer.from_crs("epsg:3067", "epsg:4326")
from_wgs84_transformer = Transformer.from_crs("epsg:4326", "epsg:3067")

origins = [
    'http://localhost:3000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/api/sun/{lon}/{lat}')
async def sun_position(lon: float, lat: float):
    time = datetime.now(tz=timezone.utc)
    altitude = solar.get_altitude(lat, lon, time)
    azimuth = solar.get_azimuth(lat, lon, time)
    return {'altitude': altitude, 'azimuth': azimuth}


@app.get('/api/sun/{lon}/{lat}/{date_time}')
async def sun_position_with_time(lon: float, lat: float, date_time: str):
    time = datetime.strptime(f'{date_time}', '%Y-%m-%d_%H:%M_%z')
    altitude = solar.get_altitude(lat, lon, time)
    azimuth = solar.get_azimuth(lat, lon, time)
    return {'altitude': altitude, 'azimuth': azimuth}


@app.get('/api/map/{x}/{y}')
async def get_map_tile(x: int, y: int):
    file_path = join(MAP_IMAGES, f'{y}x{x}.png')
    if isfile(file_path):
        return FileResponse(file_path, media_type='image/png')
    else:
        raise HTTPException(status_code=404, detail="Item not found")


@app.get('/api/heightmap/{x}/{y}')
async def get_heightmap_tile(x: int, y: int):
    file_path = join(HEIGHTMAP_IMAGES, f'{y}x{x}')
    if isfile(file_path):
        return FileResponse(file_path, media_type='application/json', headers={'Content-Encoding': 'gzip'})
    else:
        raise HTTPException(status_code=404, detail="Item not found")


@app.get('/api/coordinates/fromwgs84/{lon}/{lat}')
async def get_epsg3067(lon: float, lat: float):
    coords = from_wgs84_transformer.transform(float(lat), float(lon))
    return {'x': coords[0], 'y': coords[1]}


@app.get('/api/coordinates/towgs84/{x}/{y}')
async def get_epsg4326(x: float, y: float):
    coords = to_wgs84_transformer.transform(float(y), float(x))
    return {'lon': coords[0], 'lat': coords[1]}

@app.get('/api/shadows')
async def shadows():
    return FileResponse('./a.out.wasm', media_type='application/wasm')

@app.get('/')
async def root():
    return {'r': 't'}
