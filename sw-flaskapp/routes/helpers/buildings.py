import requests as req
from pathlib import Path
import json

def get_buildings_data() -> list:
    data = req.get('https://portalapi2.uwaterloo.ca/v2/map/Buildings')
    tmp_dict: dict = data.json()

    # Only require the contents from the 
    ret_list = tmp_dict['data']['features']
    return ret_list

def filter_building(building_data: dict) -> dict:
    """
        Filter the contents of the building into:
        {
            label: $building_code,
            value: {
                buildingName: $building_name,
                buildingCode: $building_code,
                coordinates: $coordinates
            }
        }
    """

    properties: dict = building_data['properties']
    coordinates: list = building_data['geometry']['coordinates']
    building_name = properties['buildingName']
    building_code = properties['buildingCode']
    
    return {
        'label': building_code,
        'value': json.dumps({
            'buildingName': building_name,
            'buildingCode': building_code,
            'coordinates': coordinates
        })
    }

if __name__ == "__main__":
    buildings = get_buildings_data()
    new_buildings = list(map(filter_building, buildings))
    
    with open(Path('data.json'), 'w') as file:
        file.write(json.dumps(new_buildings))

