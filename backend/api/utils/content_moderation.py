import requests

def moderate_image(image_url):
    API_USER = '544238500'    
    API_SECRET = 'qHH4NsVSUeNtnC7BcFToa2qn542ZaKF2'  

    url = "https://api.sightengine.com/1.0/check.json"
    params = {
        'url': image_url,
        'models': 'nudity,wad',  
        'api_user': API_USER,
        'api_secret': API_SECRET,
    }

    response = requests.get(url, params=params)
    result = response.json()

   
    if 'nudity' in result:
        nudity = result['nudity']
        
        if nudity.get('raw', 0) > 0.5 or nudity.get('partial', 0) > 0.5:
            return False
    return True 
