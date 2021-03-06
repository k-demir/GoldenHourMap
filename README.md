# GoldenHourMap

This is a small project that helps find the best time of the day for photography. The app uses map images and height data provided by [the National Land Survey of Finland (NLS)](https://www.maanmittauslaitos.fi/) under CC BY 4.0 license. The large map images are broken down into small tiles which are then loaded dynamically when needed. Height data for each tile is sent to the client, and the shadows are computed with Bresenham's line algorithm which is implemented in C++ and compiled into WebAssembly for better performance. The app is not currently optimized for smaller screen sizes. A short video of how the app currently works can be watched at https://streamable.com/vghlos.

## Installation

1. Download 1:10000 background map images from the [file download service](https://www.maanmittauslaitos.fi/en/e-services/open-data-file-download-service) of the NLS, and place the images into the `backend/resources/raw_map_images` directory.

2. Download corresponding 2m elevation model tiles from the [file download service](https://www.maanmittauslaitos.fi/en/e-services/open-data-file-download-service) of the NLS, and place the files into the `backend/resources/raw_heightmaps` directory.

3. Run the `backend/crop_images.py` script to break the downloaded images and heightmaps into smaller tiles.

4. Build the required WebAssembly file by running the `frontend/build_wasm.sh` script.

5. Edit the initial coordinates in the `frontend/src/App.js` file if you didn't download map tiles of central Turku.