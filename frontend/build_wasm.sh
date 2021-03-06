#!/bin/bash
cd src/utils/shadows
emcc --bind shadows.cpp -s WASM=1 -s MODULARIZE=1 -O3 -o Shadows.js -s EXPORTED_FUNCTIONS='["_getShadows"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap", "getValue", "setValue"]' -s ALLOW_MEMORY_GROWTH=1
mv Shadows.wasm ../../../public/Shadows.wasm
mv Shadows.js ../../../public/Shadows.js
cd ../../..