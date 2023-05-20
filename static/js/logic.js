
var map = L.map("map",{
    center:[25.634197,-10.7194178],
    zoom:2,
    });

initialize();


function initialize(){
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    fetchCircles("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson");
}


function fetchCircles(urlEarthquake){
d3.json(urlEarthquake).then(data=>{
    var circles=addCircles(data.features);
    circles.addTo(map)
    
});
};

function controls(map,circles){
    var baseMaps = {
        "OpenStreetMap": osm,
        "Humanitarian": streets
    };
    
    var overlayMaps = {
        "Earthquakes": circles
    };

    L.control.layers(baseMaps,overlayMaps).addTo(map);
    
}

function addCircles(features){
    let circles=L.layerGroup();
    features.forEach(feature=>{
        coordinates=[feature.geometry.coordinates[1],feature.geometry.coordinates[0]];
        radius=1.6**feature.properties.mag*15500;
        color=ranger(feature.geometry.coordinates[2])
        circles.addLayer(L.circle(coordinates,{
            radius:radius,
            color:"gray",
            weight:1,
            fillColor:color,
            fillOpacity:1,})
            .bindPopup(`<h2>${feature.properties.place}</h2>
            <hr>Magnitude: ${feature.properties.mag}<br>
            Depth: ${feature.geometry.coordinates[2]}`));
    });
    return circles 
};

function ranger(data){
    switch(true){
        case data<10:
            return colorpicker("-10 - 10")
        case data<30:
            return colorpicker("10 - 30")
        case data<50:
            return colorpicker("30 - 50")
        case data<70:
            return colorpicker("50 - 70")
        case data<90:
            return colorpicker("70 - 90")
        default:
            return colorpicker("90+")
    };
}
function colorpicker(data){
    
    switch(data){
        case "-10 - 10":
            return "#a3f600"
        case "10 - 30":
            return "#dcf400"
        case "30 - 50":
            return "#f7db11"
        case "50 - 70":
            return "#fdb72a"
        case "70 - 90":
            return "#fca35d"
        case "90+":
            return "#ff5f65"
    };
}

var selector = L.control({position:"topright"});
selector.onAdd = function(){
    var div2 = L.DomUtil.create("div","selector");
    div2.innerHTML="<select id='timeSelect'>\
                    <option value='hour'>1 Hour ago</option>\
                    <option value='day'>1 Day ago</option>\
                    <option value='week' selected>7 Days ago</option>\
                    <option value='month'>30 Days ago</option>\
                    </select>\
                    <select id='magSelect'>\
                    <option value='all'>All Earthquakes</option>\
                    <option value='1.0'>M1.0+ Earthquakes</option>\
                    <option value='2.5' selected>M2.5+ Earthquakes</option>\
                    <option value='4.5'>M4.5+ Earthquakes</option>\
                    <option value='significant'>Significant Earthquakes</option>\
                    </select>";
    return div2;
}
selector.addTo(map)


var legend = L.control({position: 'bottomright'});
legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'infoLegend');
    let grades = ["-10 - 10", "10 - 30", "30 - 50", "50 - 70", "70 - 90", "90+"];
     // loop through our density intervals and generate a label with a colored square for each interval
    let content= "<h3>Depth</h3><table>";
    for (var i = 0; i < grades.length; i++) {
        content += "<tr><td style=background-color:" + colorpicker(grades[i]) + "></td><td>"+grades[i]+"</td></tr>";
    };
    content+= "</table>";
    div.innerHTML += content;
    return div;
    };
legend.addTo(map);



d3.selectAll("select").on("change",()=>{
    map.eachLayer((layer) =>{
        if (!Object.keys(layer).includes("_url")){
            map.removeLayer(layer);
        };
    });
    let time=d3.select("select#timeSelect").property("value");
    let mag=d3.select("select#magSelect").property("value");
    let url=`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${mag}_${time}.geojson`
    fetchCircles(url);
});
