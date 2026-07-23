from source import get_camera_position, CameraPosition
from pprint import pprint
def main():
    date:list[CameraPosition] = get_camera_position()
    pprint(date)
if __name__ == "__main__":
    main()