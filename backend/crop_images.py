import os
import shutil
import json
import gzip
import numpy as np
from PIL import Image


def get_upper_left_corner_coordinates(file_path: str) -> tuple:
    with open(file_path) as metadata_file:
        lines = metadata_file.readlines()
        lines = [int(float(x[:-2])) for x in lines]
        x_coord = lines[4] - lines[0] // 2
        y_coord = lines[5] - lines[3] // 2
        return (x_coord, y_coord)


def crop_image(file_path: str, upper_left_x_coord: int, upper_left_y_coord: int, dest_dir: str) -> None:
    IMG_SIZE = 6000
    NEW_IMG_SIZE = 200
    with Image.open(file_path) as img:
        if img.size[0] != IMG_SIZE or img.size[1] != IMG_SIZE:
            raise ValueError('Image does not have the correct size of 6000x6000 pixels.')
        for i in range(0, IMG_SIZE, NEW_IMG_SIZE):
            for j in range(0, IMG_SIZE, NEW_IMG_SIZE):
                cropped_img = img.crop((i, j, i+NEW_IMG_SIZE, j+NEW_IMG_SIZE))
                cropped_img.save(os.path.join(dest_dir, f'{upper_left_x_coord+2*i}x{upper_left_y_coord-2*j}.png'))


def create_cropped_images(raw_img_dir, img_dir):
    image_names = [x[:-4] for x in os.listdir(raw_img_dir) if x[-4:] == '.png']
    for image_name in image_names:
        x_coord, y_coord = get_upper_left_corner_coordinates(os.path.join(raw_img_dir, f'{image_name}.pgw'))
        crop_image(os.path.join(raw_img_dir, f'{image_name}.png'), x_coord, y_coord, img_dir)


def crop_heightmap(file_path: str, dest_dir: str) -> None:
    IMG_SIZE = 3000
    NEW_IMG_SIZE = 200
    with Image.open(file_path) as img:
        if img.size[0] != IMG_SIZE or img.size[1] != IMG_SIZE:
            raise ValueError('Heightmap does not have the correct size of 3000x3000 pixels.')
            
        upper_left_x_coord, upper_left_y_coord = [int(x) for x in img.tag.get(33922)[3:5]]
        heightmap_array = np.round(np.array(img)).astype(np.int8)
        
        for i in range(0, IMG_SIZE, NEW_IMG_SIZE):
            for j in range(0, IMG_SIZE, NEW_IMG_SIZE):
                cropped_array = heightmap_array[j:j+NEW_IMG_SIZE, i:i+NEW_IMG_SIZE]
                json_data = json.dumps(cropped_array.tolist(), indent=2)
                encoded_json = json_data.encode('utf-8')
                with open(os.path.join(dest_dir, f'{upper_left_x_coord+2*i}x{upper_left_y_coord-2*j}'), 'wb') as f:
                    f.write(gzip.compress(encoded_json))


def create_cropped_heightmaps(raw_heightmap_dir, heightmap_dir):
    heightmap_names = [x[:-4] for x in os.listdir(raw_heightmap_dir) if x[-4:] == '.tif']
    for heightmap_name in heightmap_names:
        crop_heightmap(os.path.join(raw_heightmap_dir, f'{heightmap_name}.tif'), heightmap_dir)


def crop_images_and_heightmaps(raw_img_dir, img_dir, raw_heightmap_dir, heightmap_dir, verbose=True,
                               remove_unnecessary_files=True):
    if verbose:
        print('Initializing directories...')
    if os.path.exists(img_dir):
        shutil.rmtree(img_dir)
    if os.path.exists(heightmap_dir):
        shutil.rmtree(heightmap_dir)
    os.makedirs(img_dir)
    os.makedirs(heightmap_dir)

    if verbose:
        print('Cropping map tiles...')
    create_cropped_images(raw_img_dir, img_dir)
    if verbose:
        print('Cropping heightmaps...')
    create_cropped_heightmaps(raw_heightmap_dir, heightmap_dir)
    
    if remove_unnecessary_files:
        if verbose:
            print('Removing unnecessary files...')
        created_imgs = [x[:-4] for x in os.listdir(img_dir)]
        created_heightmaps = [x for x in os.listdir(heightmap_dir)]
        intersection = list(set(created_imgs) & set(created_heightmaps))

        for img_file in os.listdir(img_dir):
            if img_file[:-4] in intersection:
                continue
            os.remove(os.path.join(img_dir, img_file))

        for heightmap_file in os.listdir(heightmap_dir):
            if heightmap_file in intersection:
                continue
            os.remove(os.path.join(heightmap_dir, heightmap_file))

    if verbose:
        print('Everything is ready.')


if __name__ == '__main__':
    crop_images_and_heightmaps(
        './resources/raw_map_images',
        './resources/map_images',
        './resources/raw_heightmaps',
        './resources/heightmaps',
        verbose=True,
        remove_unnecessary_files=True
    )