// Vihjesuunnistuksen koodi
// S Lohi 2023



// Etäisyyden laskentaan käytettävä funktio, napattu jostain Stackoverflowsta tms.

function pythagoreanDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
    const y = (lat2-lat1);
    const d = Math.sqrt(x*x + y*y) * R;
    return d/100;
  }


// Leaflet kartta-alusta, käytössä Helsingin kaupungin OSM karttatyyli

var mymap = L.map('map', {
    renderer: L.canvas()
}).setView([60.170291, 24.941455], 13);

// http://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}@2x@fi.png
// https://kartta.hel.fi/ws/geoserver/avoindata/gwc/service/tms/1.0.0/avoindata:Karttasarja_harmaa@EPSG:3857_512/{z}/{x}/{y}@2x@fi.png

var karttasarjaHarmaa = L.tileLayer('https://kartta.hel.fi/ws/geoserver/avoindata/gwc/service/tms/1.0.0/avoindata:Karttasarja_harmaa@EPSG:3857_512/{z}/{x}/{-y}.png', {
    maxZoom: 18,
})


// Helsingin OSM tyylitys

var hkiOsm = L.tileLayer('https://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}@2x@fi.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Lisätään Helsinki OSM


hkiOsm.addTo(mymap)

var mylocation;

// Lisätään taustakarttoihin HkiOSM

var taustaKartat = {
    "Helsinki OSM": hkiOsm
}

var karttatasot = {
}

L.control.layers(taustaKartat,karttatasot, {
  collapsed: false
})

// Markkereiden tyylitys

var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#FF5733",
  color: "#0000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

// Rastit ja niiden sijainnit

var rastiLayer = L.featureGroup()

var rautatientori = {
  "rastinumero": 1,
  "vihjeSeuraavaan": "tässä on vihje, jonka avulla seuraava rasti pitäisi löytyä: <br> Valitettavasti vihjettä ei löytynyt, koska rastejakaan ei oikein ole :/",
  "latitude": 60.201993,
  "longitude": 24.968770
}

var capsa = {
  "rastinumero": 2,
  "vihjeSeuraavaan": "tässä on vihje, joka on melko huono: vihjettä ei ole",
  "latitude": 60.211958,
  "longitude": 24.953384
}

const rastit = []
rastit.push(rautatientori)
rastit.push(capsa)


function lataaRastitLayerille(rasti) {
  let rastiTappa = L.circleMarker([rasti.latitude, rasti.longitude], geojsonMarkerOptions)
  rastiTappa.bindPopup(`Onnittelut! Löysit rastin numero ${rasti.rastinumero}! <br> <br> Vihje seuraavaan: ${rasti.vihjeSeuraavaan}`)
  rastiTappa.addTo(rastiLayer)
}

rastit.forEach(lataaRastitLayerille)

function naytaRastit() {
    rastiLayer.addTo(mymap)
}

function piilotaRastit() {
  mymap.removeLayer(rastiLayer)
}

// Leafletin määrityksiä

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// Funktio jos position tarkastamiseen (ja voi lisätä sijainnin kartalle)

async function success(pos) {
  const crd = pos.coords;
  mylocation = crd;

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);

 // var marker = L.marker([crd.latitude, crd.longitude])
//  marker.addTo(mymap);
  console.log(pythagoreanDistanceBetweenPoints(mylocation.latitude, mylocation.longitude, rautatientori.latitude, rautatientori.longitude))
  console.log(pythagoreanDistanceBetweenPoints(mylocation.latitude, mylocation.longitude, capsa.latitude, capsa.longitude))

}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Leaflet navigaattorin säädöt
// watchPosition looppaa jatkuvasti, testataan toimiiko vaikka sen poistaa

navigator.geolocation.getCurrentPosition(success, error, options);
// id = navigator.geolocation.watchPosition(success, error, options);

// navigator.geolocation.watchPosition(success, error, options);




// Funktio käyttäjän sijainnin näyttämiseen

async function naytaKayttajanSijainti() {
  navigator.geolocation.getCurrentPosition(success, error, options);
  document.getElementById("teksti").innerHTML = mylocation.latitude + " " + mylocation.longitude + "<br> Tarkkuudella n. " + mylocation.accuracy + " metriä."

  // luodaan markkeri käyttäjän sijainnin kohdalle ja lisätään se kartalle 
  let tappa = L.circleMarker([mylocation.latitude, mylocation.longitude], geojsonMarkerOptions)
  tappa.addTo(mymap)
  // Pistetään värinät puhelimeen ja siirretään karttanäkymä käyttäjän sijaintiin
  //  navigator.vibrate(200)
  navigator.vibrate([100,30,100,30,100,30,200,30,200,30,200,30,100,30,100,30,100]); // Vibrate 'SOS' in Morse.
  mymap.flyTo([mylocation.latitude, mylocation.longitude], 15, {animate: true, duration: 0.75})
  document.getElementById("tekstiruutu").style.display = "block"
}




// Testataan onko mobiili

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Tarkastetaan onko käyttäjä lähellä rastia

async function tarkastaRasti() {
  navigator.geolocation.getCurrentPosition(success, error, options);
  let etaisyys = pythagoreanDistanceBetweenPoints(mylocation.latitude, mylocation.longitude, capsa.latitude, capsa.longitude)
  let naytettavaTeksti = "";

  if (etaisyys < 100) {
    naytettavaTeksti = "Rasti alle sadan metrin sisällä!"
  } else if (etaisyys < 300) {
    nayetttavaTeksti = "Lämpenee lämpenee... rasti alle 300 metrin päässä."
  } else {
    naytettavaTeksti = "Olet vielä yli 300 metrin päässä lähimmästä rastista. Jatka etsimistä!"
  }

  document.getElementById("teksti").innerHTML = naytettavaTeksti
  document.getElementById("tekstiruutu").style.display = "block"

}


// Käyttöliittymä ja ohjeet

// 1 Infotekstin näyttäminen

function naytaInfo() {
  let infoteksti = `
  <h2>Tervetuloa vihjesuunnistuksen pariin! </h2> 
  <br> Tähän tulee peliohjeet <br>
  `

  document.getElementById("teksti").innerHTML = infoteksti
  document.getElementById("tekstiruutu").style.display = "block"
  //document.getElementById("sisalto").class = infotyyli

}

// 2 Peliasetukset

function naytaAsetukset() {
  let asetusteksti = `
  <h2> Peliasetukset </h2> 
  <br> Laita huijausmoodi <button id="huijauksetPaalle"> TÄSTÄ </button> <br>
  Laita huijausmoodi <button id="huijauksetPois"> POIS </button> <br>
  Aseta keksi <button id="asetaKeksi"> Tästä </button> <br>
  Poista keksit <button id="poistaKeksit"> Tästä </button> <br>
  `
  document.getElementById("teksti").innerHTML = asetusteksti
  document.getElementById("tekstiruutu").style.display = "block"
  document.getElementById("huijauksetPaalle").addEventListener('click', naytaRastit)
  document.getElementById("huijauksetPois").addEventListener('click', piilotaRastit)
  document.getElementById("asetaKeksi").addEventListener('click', asetaKeksi)
  document.getElementById("poistaKeksit").addEventListener('click', poistaKeksit)
}

function piilotaLoota() {
  document.getElementById("tekstiruutu").style.display = "none"
}

// Mobiili vs Desktop säädöt

if (isMobile) {
  document.getElementById("naytaSijaintiNappi").addEventListener('touchend', naytaKayttajanSijainti)
  document.getElementById("infoNappi").addEventListener('touchend', naytaInfo)
  document.getElementById("asetusNappi").addEventListener('touchend', naytaAsetukset)
  document.getElementById("ruksi").addEventListener('touchend', piilotaLoota)
  document.getElementById("tarkastaRastiNappi").addEventListener('touchend', tarkastaRasti)
} else {
  document.getElementById("naytaSijaintiNappi").addEventListener('click', naytaKayttajanSijainti)
  document.getElementById("infoNappi").addEventListener('click', naytaInfo)
  document.getElementById("asetusNappi").addEventListener('click', naytaAsetukset)
  document.getElementById("ruksi").addEventListener('click', piilotaLoota)
  document.getElementById("tarkastaRastiNappi").addEventListener('click', tarkastaRasti)
}

// Ikkunan koon säädöt ikkunan koon muuttuessa 

const resizeOps = () => {
  document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
};

resizeOps();
window.addEventListener("resize", resizeOps);

// Koko ikkunan kokoinen kartta

let leveys = window.innerWidth
let korkeus = window.innerHeight

document.getElementById("map").style.width = leveys
document.getElementById("map").style.height = korkeus


// Keksien käsittely https://javascript.info/cookie saitilta


// returns the cookie with the given name,
// or undefined if not found
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}


// Sets the cookie’s name to the given value with path=/ by default (can be modified to add other defaults):

function setCookie(name, value, attributes = {}) {

  attributes = {
    path: '/',
    // add other defaults here if necessary
    ...attributes
  };

  if (attributes.expires instanceof Date) {
    attributes.expires = attributes.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let attributeKey in attributes) {
    updatedCookie += "; " + attributeKey;
    let attributeValue = attributes[attributeKey];
    if (attributeValue !== true) {
      updatedCookie += "=" + attributeValue;
    }
  }

  document.cookie = updatedCookie;
}

// Example of use:
// setCookie('user', 'John', {secure: true, 'max-age': 3600});

function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}

function asetaKeksi() {
  setCookie('tehtavassa', '1', {secure: true, 'max-age': 31536000})
}

function poistaKeksit() {
  deleteCookie('tehtavassa')
}



