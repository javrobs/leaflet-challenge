
var map = L.map("map",{
    center:[25.634197,-10.7194178],
    zoom:2,
    });


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)


d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson").then(data=>{
    console.log(data.features[0])
    addCircles(data.features);
});


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
    circles.addTo(map)    
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


var legend = L.control({position: 'bottomright'});
legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'infoLegend');
    let grades = ["-10 - 10", "10 - 30", "30 - 50", "50 - 70", "70 - 90", "90+"];
     // loop through our density intervals and generate a label with a colored square for each interval
    let content= "<h3>Depth</h3><table>";
    for (var i = 0; i < grades.length; i++) {
        console.log("hello");
        content += "<tr><td style=background-color:" + colorpicker(grades[i]) + "></td><td>"+grades[i]+"</td></tr>";
    };
    content+= "</table>";
    console.log(content);
    div.innerHTML += content;
    return div;
    };
legend.addTo(map);
