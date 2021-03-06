#include <vector>
#include <array>
#include <cmath>
#include <cstddef>
#include <emscripten/bind.h>
#include <emscripten.h>

using namespace std;
using namespace emscripten;

struct Point {
    int x;
    int y;
};

void markShadows(const vector<Point>& pointList, int* shadowsPtr, const int& width, const int& arrayLength) {
    for (auto point : pointList) {
        int idx = width * point.y + point.x;
        if (idx < arrayLength)
            shadowsPtr[idx] = 1;
    }
}

void bresenham(int x1, int y1, int z1, const int& x2, const int& y2, const int& z2,
 const int* heightmapPtr, int* shadowsPtr, const int& width, const int& height, const int& length) {
    vector<Point> visitedPoints;
    auto dx = abs(x2 - x1);
    auto dy = abs(y2 - y1);
    auto dz = abs(z2 - z1);
    auto x0 = x1;
    auto y0 = y1;
    auto xs = (x2 > x1 ? 1 : -1);
    auto ys = (y2 > y1 ? 1 : -1);
    auto zs = (z2 > z1 ? 1 : -1);

    if (dx >= dy && dx >= dz) {
        auto p1 = 2*dy - dx;
        auto p2 = 2*dz - dx;
        while (x1 != x2) {
            x1 += xs;
            if (x1 < 0 || x1 >= width) {
                break;
            }
            if (p1 >= 0) {
                y1 += ys;
                if (y1 < 0 || y1 >= height) {
                    break;
                }
                p1 -= 2*dx;
            }
            if (p2 >= 0) {
                z1 += zs;
                p2 -= 2*dx;
            }
            if (z1 <= round(heightmapPtr[width*y1+x1])) {
                break;
            }
            p1 += 2*dy;
            p2 += 2*dz;
            visitedPoints.push_back(Point {x1, y1});
        }
    } else if (dy >= dx && dy >= dz) {
        auto p1 = 2*dx - dy;
        auto p2 = 2*dz - dy;
        while (y1 != y2) {
            y1 += ys;
            if (y1 < 0 || y1 >= height) {
                break;
            }
            if (p1 >= 0) { 
                x1 += xs;
                if (x1 < 0 || x1 >= width) {
                    break;
                }
                p1 -= 2*dy;
            }
            if (p2 >= 0) {
                z1 += zs;
                p2 -= 2*dy;
            }
            if (z1 <= round(heightmapPtr[width*y1+x1])) {
                break;
            }
            p1 += 2*dx;
            p2 += 2*dz;
            visitedPoints.push_back(Point {x1, y1});
        }
    } else {        
        auto p1 = 2*dy - dz;
        auto p2 = 2*dx - dz;
        while (z1 != z2) {
            z1 += zs;
            if (p1 >= 0) {
                y1 += ys;
                if (y1 < 0 || y1 >= height) {
                    break;
                }
                p1 -= 2*dz;
            }
            if (p2 >= 0) {
                x1 += xs;
                if (x1 < 0 || x1 >= width) {
                    break;
                }
                p2 -= 2*dz;
            }
            if (z1 <= round(heightmapPtr[width*y1+x1])) {
                break;
            }
            p1 += 2*dy;
            p2 += 2*dx;
            visitedPoints.push_back(Point {x1, y1});
        }
    }
    markShadows(visitedPoints, shadowsPtr, width, length);
}

extern "C" {
    void getShadows(const int* heightmapPtr, int* shadowsPtr, int width, int height, int length, float altitude, float azimuth) {
        auto alt = altitude*M_PI/180.0;
        auto azi = azimuth*M_PI/180.0;
        const float SUN_DIST = 100000.0;
        auto sunX = (int)-round(sin(azi) * SUN_DIST);
        auto sunY = (int)round(cos(azi) * SUN_DIST);
        auto sunZ = (int)-round(2 * tan(alt) * SUN_DIST);

        if (altitude <= 0) {
            for (int i=0; i<length; i++) {
                shadowsPtr[i] = 1;
        }
            return;
        }

        for (int i=0; i<length; i++) {
            shadowsPtr[i] = 0;
        }
        
        for (int i=0; i<length; i++) {
            if (shadowsPtr[i] != 1) {
                bresenham(i%width, i/width, heightmapPtr[i], sunX, sunY, sunZ, heightmapPtr, shadowsPtr, width, height, length);
            }
        }
    }
}

EMSCRIPTEN_BINDINGS(shadow_computations) {
    emscripten::function("getShadows", &getShadows, allow_raw_pointers());
}