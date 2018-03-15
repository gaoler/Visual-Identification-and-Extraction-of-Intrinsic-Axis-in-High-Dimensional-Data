/**
 * Created by Administrator on 2016/11/15.
 */

//用鼠标绘制曲线
function alterDrawLine() {
    var drawAltermationPath = function () {
        d3.selectAll("defs").remove();
        d3.select("#alterPath").remove();
        var defs = svg.append("defs");
        var arrowMarker = defs.append("marker")
                            .attr("id","arrow")
                            .attr("markerUnits","strokeWidth")
                            .attr("markerWidth","12")
                            .attr("markerHeight","12")
                            .attr("viewBox","0 0 12 12")
                            .attr("refX","6")
                            .attr("refY","6")
                            .attr("orient","auto");
        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
                .attr("d",arrow_path)
                .attr("fill","#000")
                .attr("id", "markPath");

        var line = d3.svg.line().interpolate("basis");
        svg.append("path")
            .attr("stroke", "#0066CC")
            .attr("stroke-width", 1)
            .attr("d", line(coords))
            .attr("fill-opacity", 0)
            .attr("id", "alterPath")
            //.attr("marker-start","url(#arrow)")
            //.attr("marker-mid","url(#arrow)")
            .attr("marker-end","url(#arrow)");
    };
    var dragStart = function() {
        force.stop();
        coords = [];
        svg.selectAll("path").each(function() {
            var id = d3.select(this).attr("id");
            if(id == "alterPath") {
                d3.select(this).remove();
            }
        })
    };
    var dragMove = function () {
        coords.push(d3.mouse(this));
        drawAltermationPath();
    };
    var dragEnd = function(){
        //console.log(coords);
        d3.select("#alterPath").remove();
        if(coords.length > 2) {
            getLine(coords);
        }
    };

    var coords = [];  //保存绘制点线
    var drag = d3.behavior.drag()
        .on("dragstart", dragStart)
        .on("drag", dragMove)
        .on("dragend", dragEnd);
    this.chart = document.getElementById("pvPlot");
    var svg = d3.select(this.chart).select("#svg1");
    svg.call(drag);
}
//*********************************//

function drawLineChoosePoint(){
    var coords = [];  //保存绘制点线
    var pointInPolygon = function (point, vs) {
        var xi, xj, i, intersect,
            x = point[0],
            y = point[1],
            inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            xi = vs[i][0],
                yi = vs[i][1],
                xj = vs[j][0],
                yj = vs[j][1],
                intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };
    var drawAltermationPath = function () {
        d3.selectAll("#drawChoosePath").remove();
        var line = d3.svg.line().interpolate("basis");
        svg.append("path")
            .attr("stroke", "#0066CC")
            .attr("stroke-width", 1)
            .attr({
                d: line(coords)

            })
            .attr("fill-opacity", 0)
            .attr("id", "drawChoosePath");
    };
    var dragStart = function() {
        svg.selectAll("#alterPath").remove();
        coords = [];
        svg.selectAll("path").each(function() {
            var id = d3.select(this).attr("id");
            if(id == "drawChoosePath") {
                d3.select(this).remove();
            }
        })
    };
    var dragMove = function () {
        coords.push(d3.mouse(this));
        drawAltermationPath();
    };
    var dragEnd = function(){
        var svg1 = d3.select("#svg1");
        var svg2 = d3.select("#scatterSvg");
        svg1.selectAll(".yellowClass")
            .attr("class","normalClass");
        svg2.selectAll(".yellowClass")
            .attr("class","normalClass");
        if(leftPoint.length) {
            leftPoint.attr("class", "leftPoint");
        }

        var xchoose = svg1.selectAll(".xChoosePoint");
        var ychoose = svg1.selectAll(".yChoosePoint");

        for(var i = 0; i < originData.length; i ++){
            if(pointInPolygon([nodes[i].x  * nowScale + nowTran[0], nodes[i].y * nowScale + nowTran[1]], coords)){
                svg1.select("#forceCircle" + i)
                    .attr("class","yellowClass");
                svg2.select("#scatterCircle" + i)
                    .attr("class","yellowClass");
            }
        }
        xchoose.attr("class", "xChoosePoint");
        ychoose.attr("class", "yChoosePoint");

        d3.selectAll("#drawChoosePath")
            .remove();
    };
    var dragChooseLine = d3.behavior.drag()
        .on("dragstart", dragStart)
        .on("drag", dragMove)
        .on("dragend", dragEnd);
    var svg = d3.select("#svg1");
    svg.call(dragChooseLine);
}

function updateLine(fixIndex, dragMovex, dragMovey, flag){
    var originFixIndex = fixIndex;
    visitOver[fixIndex] = 1;
    for(var m = -1; m < fixOverPoint.length; m ++) {
        if(!flag){
            m = 0;
            flag = 1;
        }
        if(m != -1){
            if(fixOverPoint[m][0] == originFixIndex){
                if(visitOver[fixOverPoint[m][1]]){
                    continue;
                }
                fixIndex = fixOverPoint[m][1];
                updateLine(fixIndex, dragMovex, dragMovey, 1);
            }
            else if(fixOverPoint[m][1] == originFixIndex){
                if(visitOver[fixOverPoint[m][0]]){
                    continue;
                }
                fixIndex = fixOverPoint[m][0];
                updateLine(fixIndex, dragMovex, dragMovey, 1);
            }
            continue;
        }
        for (var i = 0; i < fixPoint[fixIndex].length; i++) {
            var dragpx = fixPoint[fixIndex][i][1] + dragMovex;
            var dragpy = fixPoint[fixIndex][i][2] + dragMovey;
            fixPoint[fixIndex][i][1] = dragpx;
            fixPoint[fixIndex][i][2] = dragpy;
            var temid = document.getElementById(fixIndex + "dragPoint" + i);
            temid.setAttribute("cx", dragpx);
            temid.setAttribute("cy", dragpy);
            var j = i - 1;
            if (i == fixPoint[fixIndex].length - 1) {
                temid = document.getElementById(fixIndex + "dragLine" + j);
                temid.setAttribute("x2", dragpx);
                temid.setAttribute("y2", dragpy);
                continue;
            }
            temid = document.getElementById(fixIndex + "dragLine" + i);
            temid.setAttribute("x1", dragpx);
            temid.setAttribute("y1", dragpy);
            j = i - 1;
            if (j < 0) {
                continue;
            }
            temid = document.getElementById(fixIndex + "dragLine" + j);
            temid.setAttribute("x2", dragpx);
            temid.setAttribute("y2", dragpy);
        }
    }
    return;
}

function dragLine(valueIndex){
    var dragMovex = 0;
    var dragMovey = 0;
    var drag = d3.behavior.drag()
        .on("dragstart", function(d){

        })
        .on("drag", function(d){
            dragMovex = d3.event.dx;
            dragMovey = d3.event.dy;
            var dragpid = d3.select(this)[0][0].id;
            var fixIndex = parseInt(dragpid);
            visitOver = [];
            for(var i = 0; i < fixPoint.length; i ++) {
                visitOver.push(0);
            }
            updateLine(fixIndex, dragMovex, dragMovey, 1);
            force.start();
        })
        .on("dragend", function(d){

        });

    for(var i = 1; i < fixPoint[valueIndex].length; i ++){
        var j = i - 1;
        var a = document.getElementById(valueIndex + "dragLine" + j);
        a.setAttribute("id", "temDragPoint");
        d3.select("#temDragPoint").call(drag);
        document.getElementById("temDragPoint").setAttribute("id", valueIndex + "dragLine" + j);
        if(i == fixPoint[valueIndex].length - 1){
            continue;
        }
        a = document.getElementById(valueIndex + "dragPoint" + i);
        a.setAttribute("id", "temDragPoint");
        d3.select("#temDragPoint").call(drag);
        document.getElementById("temDragPoint").setAttribute("id", valueIndex + "dragPoint" + i);
    }

}

function dragPoint(valueIndex){
    var dist = [];
    var zdist = 0;
    var dragMovex = 0;
    var dragMovey = 0;
    var drag = d3.behavior.drag()
        .on("dragstart", function(d){
            var dragpid = d3.select(this)[0][0].id;
            var fixIndex = parseInt(dragpid);
            var tems = 0;
            dist = [];
            zdist = 0;
            dist.push(0);
            for(var i = 0; i < fixPoint[fixIndex].length - 1; i ++){
                tems =  Math.sqrt(Math.pow(fixPoint[fixIndex][i][1] - fixPoint[fixIndex][i + 1][1], 2) + Math.pow(fixPoint[fixIndex][i][2] - fixPoint[fixIndex][i + 1][2], 2));
                dist.push(tems);
                zdist += tems;
            }
        })
        .on("drag", function(d){
            dragMovex = d3.event.dx;
            dragMovey = d3.event.dy;
            var dragpid = d3.select(this)[0][0].id;
            var fixIndex = parseInt(dragpid);
            dragpid = dragpid.replace(fixIndex, '');
            var value1 = parseInt(dragpid.replace(/[^0-9]/ig,""));
            var value2 = fixPoint[fixIndex].length - 1 - value1;
            var movex = fixPoint[fixIndex][value1][1] + dragMovex;
            var movey = fixPoint[fixIndex][value1][2] + dragMovey;
            var stDis = Math.sqrt(Math.pow(fixPoint[fixIndex][value2][1]- movex, 2) + Math.pow(fixPoint[fixIndex][value2][2]- movey, 2)) / zdist;
            var angleArry = angleFunction(fixPoint[fixIndex][value2][1], fixPoint[fixIndex][value2][2], movex, movey);
            var angle = angleArry[0];
            var angle2 = angleArry[1];
            var s = 0;
            var ovnum = 0;
            var position = -1;
            for(var i = 0; i < fixOverPoint.length; i ++){
                if(fixIndex == fixOverPoint[i][0]){
                    ovnum ++;
                    position = fixOverPoint[i][2];
                }
                else if(fixIndex == fixOverPoint[i][1]){
                    ovnum ++;
                    position = fixOverPoint[i][3];
                }
                else{
                    continue;
                }
            }
            if(!ovnum) {
                if (value1 < value2) {
                    for (var i = value2; i > 0; i--) {
                        s += (dist[i] * stDis);
                        rotatePoint(s, i - 1, angle, value2, fixIndex);
                    }
                }
                else {
                    for (var i = 1; i < dist.length; i++) {
                        s += (dist[i] * stDis);
                        rotatePoint(s, i, angle, value2, fixIndex);
                    }
                }
                force.start();
            }
            else if(ovnum == 1){
                if (value1 < value2) {
                    s = 0;
                    for (var i = position + 1; i < dist.length; i++) {
                        s += (dist[i] * stDis);
                        rotatePoint(s, i, angle2, position, fixIndex);
                    }
                    s = 0;
                    for (var i = position; i > 0; i--) {
                        s += (dist[i] * stDis);
                        rotatePoint(s, i - 1, angle, position, fixIndex);
                    }
                }
                else {
                    s = 0;
                    for (var i = position + 1; i < dist.length; i++) {
                        s += (dist[i] * stDis);
                        rotatePoint(s, i, angle, position, fixIndex);
                    }
                    s = 0;
                    for (var i = position; i > 0; i--) {
                        s += (dist[i] * stDis);
                        rotatePoint(s, i - 1, angle2, position, fixIndex);
                    }
                }
                force.start();
            }
        })
        .on("dragend", function(d){

        });
    var a = document.getElementById(valueIndex + "dragPoint0");
    a.setAttribute("id", "temDragPoint");
    d3.select("#temDragPoint").call(drag);
    document.getElementById("temDragPoint").setAttribute("id", valueIndex + "dragPoint0");
    var tem = fixPoint[valueIndex].length - 1;
    //d3.select("#" + valueIndex + "dragPointId" + tem).call(drag);
    a = document.getElementById(valueIndex + "dragPoint" + tem);
    a.setAttribute("id", "temDragPoint");
    d3.select("#temDragPoint").call(drag);
    document.getElementById("temDragPoint").setAttribute("id", valueIndex + "dragPoint" + tem);
}

function rotatePoint(s, i, angle, value2, index){
    var x = s * Math.cos(angle);
    var y = s * Math.sin(angle);
    var dragpx = fixPoint[index][value2][1] + x;
    var dragpy = fixPoint[index][value2][2] + y;
    var temid = document.getElementById(index + "dragPoint" + i);
    temid.setAttribute("cx", dragpx);
    temid.setAttribute("cy", dragpy);
    if(i < fixPoint[index].length - 1) {
        temid = document.getElementById(index + "dragLine" + i);
        temid.setAttribute("x1", dragpx);
        temid.setAttribute("y1", dragpy);
        if (i - 1 >= 0) {
            var temi = i - 1;
            temid = document.getElementById(index + "dragLine" + temi);
            temid.setAttribute("x2", dragpx);
            temid.setAttribute("y2", dragpy);
        }
    }
    else{
        var temi = i - 1;
        temid = document.getElementById(index + "dragLine" + temi);
        temid.setAttribute("x2", dragpx);
        temid.setAttribute("y2", dragpy);
    }
    fixPoint[index][i][1] = dragpx;
    fixPoint[index][i][2] = dragpy;
}


function angleFunction(startx, starty, endx, endy){
    var diff_x = endx - startx;
    var diff_y = endy - starty;
    //返回角度,不是弧度
    var tem = 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
    var angle = 0;
    var angle2 = 0;
    if(tem < 0){
        if(diff_x < 0){
            angle = 180 + tem;
            angle2 = 360 + tem;
        }
        else{
            angle = 360 + tem;
            angle2 = 180 + tem;
        }
    }
    else{
        if(diff_x < 0){
            angle = 180 + tem;
            angle2 = tem;
        }
        else{
            angle = tem;
            angle2 = 180 + tem;
        }
    }
    return [2.0 * Math.PI / 360.0 * angle, 2.0 * Math.PI / 360.0 * angle2];
}

function alterDrawScatter(data){
    var coords = [];  //保存绘制点线
    var pointInPolygon = function (point, vs) {
        var xi, xj, i, intersect,
            x = point[0],
            y = point[1],
            inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            xi = vs[i][0],
                yi = vs[i][1],
                xj = vs[j][0],
                yj = vs[j][1],
                intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    var drawAltermationPath = function () {
        d3.selectAll("#altermationPath").remove();
        var line = d3.svg.line().interpolate("basis");
        svg.append("path")
            .attr("stroke", "#0066CC")
            .attr("stroke-width", 1)
            .attr({
                d: line(coords)

            })
            .attr("fill-opacity", 0)
            .attr("id", "altermationPath");
    };

    var dragStart = function() {
        coords = [];
        svg.selectAll("path").each(function() {
            var id = d3.select(this).attr("id");
            if(id == "altermationPath") {
                d3.select(this).remove();
            }
        })
    };
    var dragMove = function () {
        coords.push(d3.mouse(this));
        drawAltermationPath();
    };
    var dragEnd = function(){
        var svg1 = d3.select("#svg1");
        var svg2 = d3.select("#scatterSvg");
        svg1.selectAll(".yellowClass")
            .attr("class","normalClass");
        svg2.selectAll(".yellowClass")
            .attr("class","normalClass");
        if(leftPoint.length) {
            leftPoint.attr("class", "leftPoint");
        }

        var xchoose = svg1.selectAll(".xChoosePoint");
        var ychoose = svg1.selectAll(".yChoosePoint");

        for(var i = 0; i < data.length; i ++){
            if(pointInPolygon([data[i][0], data[i][1]], coords)){
                svg1.select("#forceCircle" + i)
                    .attr("class","yellowClass");
                svg2.select("#scatterCircle" + i)
                    .attr("class","yellowClass");
            }
        }
        xchoose.attr("class", "xChoosePoint");
        ychoose.attr("class", "yChoosePoint");

        d3.selectAll("#altermationPath")
            .remove();
    };


    var drag = d3.behavior.drag()
        .on("dragstart", dragStart)
        .on("drag", dragMove)
        .on("dragend", dragEnd);
    var svg = d3.select("#scatterSvg");
    svg.call(drag);
}
