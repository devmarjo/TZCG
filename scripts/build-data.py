"""Download build-time sources; runtime never needs a network connection."""
import csv, io, json, zipfile, urllib.request, hashlib
from pathlib import Path
from datetime import datetime, timezone
root=Path(__file__).resolve().parents[1]
cache=root/'work/data'; cache.mkdir(parents=True,exist_ok=True)
def fetch(url, name):
    data=urllib.request.urlopen(url).read(); (cache/name).write_bytes(data)
    return data
cities_raw=fetch('https://download.geonames.org/export/dump/cities15000.zip','cities15000.zip')
cities=[]
with zipfile.ZipFile(io.BytesIO(cities_raw)) as z:
    for line in z.read('cities15000.txt').decode().splitlines():
        r=line.split('\t')
        if not r[17]: continue
        cities.append({'id':'city-'+r[0], 'name':r[1], 'country':r[8], 'region':r[10], 'timeZone':r[17], 'aliases':r[2], '_pop':int(r[14])})
cities.sort(key=lambda x:-x.pop('_pop'))
# Explicitly reviewed major airports: do not infer a zone from a nearest city.
zones={
'GRU':'America/Sao_Paulo','CGH':'America/Sao_Paulo','GIG':'America/Sao_Paulo','SDU':'America/Sao_Paulo','BSB':'America/Sao_Paulo','CNF':'America/Sao_Paulo','REC':'America/Recife','SSA':'America/Bahia','FOR':'America/Fortaleza','MAO':'America/Manaus','BEL':'America/Belem','POA':'America/Sao_Paulo','CWB':'America/Sao_Paulo',
'LIS':'Europe/Lisbon','OPO':'Europe/Lisbon','LHR':'Europe/London','LGW':'Europe/London','CDG':'Europe/Paris','ORY':'Europe/Paris','MAD':'Europe/Madrid','BCN':'Europe/Madrid','FRA':'Europe/Berlin','MUC':'Europe/Berlin','AMS':'Europe/Amsterdam','FCO':'Europe/Rome','MXP':'Europe/Rome','ZRH':'Europe/Zurich','IST':'Europe/Istanbul',
'JFK':'America/New_York','EWR':'America/New_York','MIA':'America/New_York','MCO':'America/New_York','LAX':'America/Los_Angeles','SFO':'America/Los_Angeles','ORD':'America/Chicago','DFW':'America/Chicago','DEN':'America/Denver','YYZ':'America/Toronto','YVR':'America/Vancouver','MEX':'America/Mexico_City','CUN':'America/Cancun','EZE':'America/Argentina/Buenos_Aires','SCL':'America/Santiago','BOG':'America/Bogota','LIM':'America/Lima',
'NRT':'Asia/Tokyo','HND':'Asia/Tokyo','KIX':'Asia/Tokyo','ICN':'Asia/Seoul','SIN':'Asia/Singapore','HKG':'Asia/Hong_Kong','PEK':'Asia/Shanghai','PVG':'Asia/Shanghai','BKK':'Asia/Bangkok','DEL':'Asia/Kolkata','BOM':'Asia/Kolkata','KTM':'Asia/Kathmandu','DXB':'Asia/Dubai','DOH':'Asia/Qatar','SYD':'Australia/Sydney','MEL':'Australia/Melbourne','AKL':'Pacific/Auckland','JNB':'Africa/Johannesburg','CPT':'Africa/Johannesburg','CAI':'Africa/Cairo'}
raw=fetch('https://davidmegginson.github.io/ourairports-data/airports.csv','airports.csv')
airports=[]
for r in csv.DictReader(io.StringIO(raw.decode())):
    code=r['iata_code']
    if code in zones and r['type'] in ('large_airport','medium_airport'):
        airports.append({'id':'airport-'+r['ident'],'name':r['municipality'] or r['name'],'country':r['iso_country'],'region':r['iso_region'],'timeZone':zones[code],'iata':code,'airport':r['name']})
assert len(airports)==len(zones),(len(airports),len(zones))
(root/'src/locations.json').write_text(json.dumps(cities+airports,ensure_ascii=False,separators=(',',':')))
manifest={'downloadedAt':datetime.now(timezone.utc).isoformat(),'cities':len(cities),'airports':len(airports),'sources':[{'url':'https://download.geonames.org/export/dump/cities15000.zip','sha256':hashlib.sha256(cities_raw).hexdigest(),'license':'CC BY 4.0'},{'url':'https://davidmegginson.github.io/ourairports-data/airports.csv','sha256':hashlib.sha256(raw).hexdigest(),'license':'Public domain'}]}
(root/'outputs/DADOS.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
