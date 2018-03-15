/**
 * Created by Administrator on 2016/11/18.
 */
function drawISOMAP(data, idname) {
    d3.select('#' + idname).select("svg").remove();
    var dvplotWidth = 400;
    var dvplotHeight = 400;
    var padding1 = {left: 20, right: 10, top: 100, bottom: 20};

    var dvplotSvg = d3.select("#" + idname)
        .append("svg")
        .attr("id", idname + "Svg")
        .attr("width", dvplotWidth)
        .attr("height", dvplotHeight);

    var xAxisWidth = dvplotWidth;
    var xScale = d3.scale.linear()
        .domain([d3.min(data, function (d) {
            return d[0];
        }), 1.2 * d3.max(data, function (d) {
            return d[0];
        })])
        .range([0, xAxisWidth]);

    var yAxisWidth = dvplotHeight - padding1.top;
    var yScale = d3.scale.linear()
        .domain([d3.min(data, function(d){
            return d[1];
        }), 1.2 * d3.max(data, function (d) {
            return d[1];
        })])
        .range([0, yAxisWidth]);
    //画线
    for(var i = 0; i < KNNMatrix.length; i ++){
        for(var j = 1; j < KNNMatrix[i].length; j ++){
            var line = dvplotSvg.append("line")
            .attr("class", idname + "Line")
            .attr("x1",padding1.left + xScale(data[i][0]))
            .attr("y1",dvplotHeight - padding1.bottom - yScale(data[i][1]))
            .attr("x2",padding1.left + xScale(data[KNNMatrix[i][j]][0]))
            .attr("y2",dvplotHeight - padding1.bottom - yScale(data[KNNMatrix[i][j]][1]));
        }
    }

    //定义颜色函数
    var colora = d3.rgb(0, 0, 225);
    var colorb = d3.rgb(225,0,0);
    var color = d3.interpolate(colora, colorb);
    var circles = dvplotSvg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", idname + "Circle")
        .attr("cx", function (d) {
            return padding1.left + xScale(d[0]);
        })
        .attr("cy", function (d) {
            return dvplotHeight - padding1.bottom - yScale(d[1]);
        })
        .attr("id", function(d, i){
            return idname + "Point" + i;
        } )
        .on("click", function(d, i){
            var distance = everyEdistance;
            if(whichReduce){
                distance = gdDistance;
            }
            for(var j = 0; j < distance.length; j ++){
                d3.select("#isomapPoint" + j)
                    .style("fill", color(distance[i][j]));
                d3.select("#tsnePoint" + j)
                    .style("fill", color(distance[i][j]));
                d3.select("#forceCircle" + j)
                    .style("fill", color(distance[i][j]));
            }
            d3.select("#isomapPoint" + i)
                .style("fill", "yellow");
            d3.select("#tsnePoint" + i)
                .style("fill", "yellow");
            d3.select("#forceCircle" + i)
                .style("fill", "yellow");
        })
        .on("mousemove", function(d, i){
            d3.select("#isomapPoint" + i)
                .style("r", 6);
            d3.select("#tsnePoint" + i)
                .style("r", 6);
        })
        .on("mouseout", function(d, i){
            d3.select("#isomapPoint" + i)
                .style("r", 4);
            d3.select("#tsnePoint" + i)
                .style("r", 4);
        });


}
function changeName(){
    var name = document.getElementById("whichReduce").innerHTML;
    if(name == "change to GD"){
        document.getElementById("whichReduce").innerHTML = "change to E";
        whichReduce = 1;
    }
    else{
        document.getElementById("whichReduce").innerHTML = "change to GD";
        whichReduce = 0;
    }
}


