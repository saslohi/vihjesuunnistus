function pythagoreanDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
    const y = (lat2-lat1);
    const d = Math.sqrt(x*x + y*y) * R;
    return d/100;
  }




var mymap = L.map('map', {
    renderer: L.canvas()
}).setView([60.170291, 24.941455], 13);

// http://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}@2x@fi.png
// https://kartta.hel.fi/ws/geoserver/avoindata/gwc/service/tms/1.0.0/avoindata:Karttasarja_harmaa@EPSG:3857_512/{z}/{x}/{y}@2x@fi.png

var karttasarjaHarmaa = L.tileLayer('https://kartta.hel.fi/ws/geoserver/avoindata/gwc/service/tms/1.0.0/avoindata:Karttasarja_harmaa@EPSG:3857_512/{z}/{x}/{-y}.png', {
    maxZoom: 18,
})



var hkiOsm = L.tileLayer('https://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}@2x@fi.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})


hkiOsm.addTo(mymap)

var mylocation;

var taustaKartat = {
    "Helsinki OSM": hkiOsm
}

var karttatasot = {
}

var rautatientori = {
  "latitude": 60.201993,
  "longitude": 24.968770
}

var capsa = {
  "latitude": 60.211958,
  "longitude": 24.953384
}

L.control.layers(taustaKartat,karttatasot, {
    collapsed: false
})

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

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

navigator.geolocation.getCurrentPosition(success, error, options);
id = navigator.geolocation.watchPosition(success, error, options);

navigator.geolocation.watchPosition(success, error, options);


var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#FF5733",
  color: "#0000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

async function naytaKayttajanSijainti() {
  navigator.geolocation.getCurrentPosition(success, error, options);
  document.getElementById("teksti").innerHTML = mylocation.latitude + " " + mylocation.longitude + "<br> Tarkkuudella n. " + mylocation.accuracy + " metri??."
  let tappa = L.circleMarker([mylocation.latitude, mylocation.longitude], geojsonMarkerOptions)
  tappa.addTo(mymap)
  //navigator.vibrate(200)
  navigator.vibrate([100,30,100,30,100,30,200,30,200,30,200,30,100,30,100,30,100]); // Vibrate 'SOS' in Morse.
  mymap.flyTo([mylocation.latitude, mylocation.longitude], 15, {animate: true, duration: 0.75})
  document.getElementById("tekstiruutu").style.display = "block"
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

async function tarkastaRasti() {
  navigator.geolocation.getCurrentPosition(success, error, options);
  let etaisyys = pythagoreanDistanceBetweenPoints(mylocation.latitude, mylocation.longitude, capsa.latitude, capsa.longitude)
  let naytettavaTeksti = "";

  if (etaisyys < 100) {
    naytettavaTeksti = "Rasti alle sadan metrin sis??ll??!"
  } else if (etaisyys < 300) {
    nayetttavaTeksti = "L??mpenee l??mpenee... rasti alle 300 metrin p????ss??."
  } else {
    naytettavaTeksti = "Olet viel?? yli 300 metrin p????ss?? l??himm??st?? rastista. Jatka etsimist??!"
  }

  document.getElementById("teksti").innerHTML = naytettavaTeksti
  document.getElementById("tekstiruutu").style.display = "block"

}



function naytaInfo() {
  let infoteksti = `
  <h2>Tervetuloa vihjesuunnistuksen pariin! </h2> 
  <br> T??h??n tulee peliohjeet <br>
  `

  document.getElementById("teksti").innerHTML = infoteksti
  document.getElementById("tekstiruutu").style.display = "block"
  //document.getElementById("sisalto").class = infotyyli

}

function naytaAsetukset() {
  let asetusteksti = `
  <h2> Peliasetukset </h2> 
  <br> Laita huijausmoodi <br>
  `
  document.getElementById("teksti").innerHTML = asetusteksti
  document.getElementById("tekstiruutu").style.display = "block"
}

function piilotaLoota() {
  document.getElementById("tekstiruutu").style.display = "none"
}


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


const resizeOps = () => {
  document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
};

resizeOps();
window.addEventListener("resize", resizeOps);

let leveys = window.innerWidth
let korkeus = window.innerHeight

document.getElementById("map").style.width = leveys
document.getElementById("map").style.height = korkeus






