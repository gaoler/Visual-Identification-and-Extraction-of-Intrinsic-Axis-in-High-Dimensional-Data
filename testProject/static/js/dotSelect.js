/**
 * Created by iris on 2016/11/12.
 */
function yRiver(){
    var width = 180;
    var height = 600;
    d3.select("#yriver").select("svg").remove();
    var svg = d3.select("#yriver")
        .append("svg")
        .attr("id", "yriverSvg")
        .attr("width",width)
        .attr("height",height);
    var stack = d3.layout.stack()
            .x(function(d){
                return d.dotPosition;
            })
            .y(function(d){
                return d.dimvalue;
            });
    var dataset = [];
    for(var i = 0; i < originData[0].length; i ++){
        var value = [];
        for(var j = 0; j < dotPath.length; j ++){
            var temvalue = {dotPosition: j, dimvalue: originData[dotPath[j]][i]};
            value.push(temvalue);
        }
        dataset.push(value);
    }
	var data = stack(dataset);
    var padding = { left:10, right:30, top:10, bottom:10 };
    var xRangeWidth = height - padding.top - padding.bottom;
    var yRangeWidth = width - padding.left - padding.right;

    var domain = [];
    domain.push(0);
    var tem = 0;
    for(var i=0;i<dotDist.length;i++){
        tem=tem+dotDist[i];
        domain.push(tem);
    }
    for(var i=0;i<domain.length;i++){
        domain[i] = (domain[i]) / domain[domain.length - 1] * xRangeWidth;
    }
    //domain.reverse();

    for(var i=0;i<domain.length;i++){
        domain[i] = xRangeWidth - domain[i];
    }

    var maxProfit = d3.max(data[data.length-1], function(d){
							return d.y0 + d.y;
					});
    var temx = [];
    for(var i = 0; i < dotPath.length; i ++){
        temx.push(i);
    }
    var xScale = d3.scale.ordinal()
            .domain(temx)
            .range(domain);
	var yScale = d3.scale.linear()
            .domain([0, maxProfit])		//定义域
            .range([0, yRangeWidth]);	//值域

	var area = d3.svg.area()
            .y(function(d){ return xScale(d.dotPosition); })
            .x0(function(d){ return yRangeWidth - yScale(d.y0); })
            .x1(function(d){ return yRangeWidth - yScale(d.y0+d.y); })
            .interpolate("basis");

	//添加分组元素
	var groups = svg.selectAll(".test")
            .data(data)
            .enter()
            .append("g")
            .style("fill",function(d,i){
                return colorRiver(i);
            })
            .on("mousemove", function(d, i){
                d3.select(this).attr("cursor", "pointer");//这里设置光标的显示的方式
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity", 1.0)
                    .html(columnName[i]);
            })
            .on("mouseout", function (d) {
                tooltip.style("opacity", 0.0);
            });

	//添加区域
	var areas = groups.append("path")
            .attr("d", function(d){
                return area(d);
            })
            .attr("transform","translate(" + padding.left + "," + padding.top + ")");

    svg.selectAll("rect").remove();
    for(var i = 0; i < domain.length - 1; i ++){
        svg.append("rect")
            .attr("x", 0)
            .attr("y", padding.top + domain[i + 1])
            .attr("width", width - padding.right)
            .attr("height", domain[i] - domain[i + 1])
            .attr("opacity", 0)
            .attr("id", "yriverRect" + i);
        document.getElementById('yriverRect' + i).style.display = 'none';
    }
    svg.selectAll("line").remove();
    for(var i = 0; i < domain.length; i ++) {
        svg.append("line")
            .attr("y1", padding.top + domain[i])
            .attr("x1", 0)
            .attr("y2", padding.top + domain[i])
            .attr("x2", width - padding.right)
            .attr("id", "yriverLine" + i)
            .attr("stroke", "yellow")
            .attr("stroke-width", "3px")
            .attr("opacity", 0);
    }
    addPitcure(domain);
}

function xRiver(){
    var width = 600;
    var height = 180;
    d3.select("#xriver").select("svg").remove();
    var svg = d3.select("#xriver")
        .append("svg")
        .attr("id", "xriverSvg")
        .attr("width",width)
        .attr("height",height);

    var stack = d3.layout.stack()
            .x(function(d){
                return d.dotPosition;
            })
            .y(function(d){
                return d.dimvalue;
            });
    var dataset = [];
    for(var i = 0; i < originData[0].length; i ++){
        var value = [];
        for(var j = 0; j < dotPath.length; j ++){
            var temvalue = {dotPosition: j, dimvalue: originData[dotPath[j]][i]};
            value.push(temvalue);
        }
        dataset.push(value);
    }
	var data = stack(dataset);

	var padding = { left:10, right:10, top:30, bottom:10 };
	//创建x轴比例尺

    var xRangeWidth = width - padding.left - padding.right;
    var yRangeWidth = height - padding.top - padding.bottom;

    var domain = [];
    domain.push(0);
    var tem = 0;
    for(var i=0;i<dotDist.length;i++){
        tem=tem+dotDist[i];
        domain.push(tem);
    }
    for(var i=0;i<domain.length;i++){
        domain[i] = (domain[i]) / domain[domain.length - 1] * xRangeWidth;
    }


	//最大利润（定义域的最大值）
	var maxProfit = d3.max(data[data.length-1], function(d){
							return d.y0 + d.y;
					});
    var temx = [];
    for(var i = 0; i < dotPath.length; i ++){
        temx.push(i);
    }
    var xScale = d3.scale.ordinal()
            .domain(temx)
            .range(domain);
	var yScale = d3.scale.linear()
            .domain([0, maxProfit])		//定义域
            .range([0, yRangeWidth]);	//值域

	var area = d3.svg.area()
            .x(function(d){ return xScale(d.dotPosition); })
            .y0(function(d){ return yScale(d.y0); })
            .y1(function(d){ return yScale(d.y0+d.y); })
            .interpolate("basis");


	//添加分组元素
	var groups = svg.selectAll(".test")
            .data(data)
            .enter()
            .append("g")
            .style("fill",function(d,i){
                return colorRiver(i);
            })
            .on("mousemove", function(d, i){
                d3.select(this).attr("cursor", "pointer");//这里设置光标的显示的方式
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity", 1.0)
                    .html(columnName[i]);
            })
            .on("mouseout", function (d) {
                tooltip.style("opacity", 0.0);
            });


	//添加区域
	var areas = groups.append("path")
            .attr("d", function(d){
                return area(d);
            })
            .attr("transform","translate(" + padding.left + "," + padding.top + ")");

    svg.selectAll("rect").remove();
    for(var i = 0; i < domain.length - 1; i ++){
        svg.append("rect")
            .attr("x", padding.left + domain[i])
            .attr("y", padding.top)
            .attr("width", domain[i + 1] - domain[i])
            .attr("height", height - padding.top)
            .attr("opacity", 0)
            .attr("id", "xriverRect" + i);
        document.getElementById('xriverRect' + i).style.display = 'none';
    }
    svg.selectAll("line").remove();
    for(var i = 0; i < domain.length; i ++) {
        svg.append("line")
            .attr("x1", padding.left + domain[i])
            .attr("y1", padding.top)
            .attr("x2", padding.left + domain[i])
            .attr("y2", height)
            .attr("id", "xriverLine" + i)
            .attr("stroke", "yellow")
            .attr("stroke-width", "3px")
            .attr("opacity", 0);
    }
    addPitcure(domain);
}

function River(){
    if(ScatterFlag % 2){
        yRiver();
    }
    else{
        xRiver();
    }
}

function ReadScatterData(xData, yData, flag){
    ScatterFlag = flag;
    var tem=[];
    if(ScatterFlag==0) {
        [scatterX, scatterY] = [xData, yData];
    }
    else{
        if(ScatterFlag%2==0){
            [scatterX,tem]=[xData, yData];

        }
        else{
            [tem,scatterY]=[yData, xData];
        }
    }

    var circledata = new Array();
    for (var i = 0; i < originData.length; i++){
        circledata[i] = new Array();
    }
    for (var i = 0; i < originData.length; i++) {
        circledata[i][0] = scatterX[i];
        circledata[i][1] = scatterY[i];
    }
    ScatterDraw(circledata);
}

//绘制投影后的相关信息（散点图）
function ScatterDraw(data){
    console.log(data);
    d3.select("#dvPlot").select("svg").remove();
    var dvplotWidth = 600;
    var dvplotHeight = 600;
    var padding1 = {left: 10, right: 10, top: 10, bottom: 10};

    var dvplotSvg = d3.select("#dvPlot")
        .append("svg")
        .attr("id", "scatterSvg")
        .attr("width", dvplotWidth)
        .attr("height", dvplotHeight);

    //画分割线
    //var xstart = 0;
    //var xend = dvplotWidth - 1
    //var lines = [[0, padding1.top - 10], [dvplotWidth - padding1.right + 10, padding1.top - 10], [dvplotWidth - padding1.right + 10, dvplotHeight - 1]];
    //var linePath = d3.svg.line();
    //dvplotSvg.append("path")
    //    .attr("d", linePath(lines))
    //    .attr("class", "divide")
    //    .style("stroke-dasharray", 5.5);
    //var lines2 = [[dvplotWidth - padding1.right + 10, 0], [dvplotWidth - padding1.right + 10, padding1.top - 10], [dvplotWidth - 1, padding1.top - 10]];
    //dvplotSvg.append("path")
    //    .attr("d", linePath(lines2))
    //    .attr("class", "divide")
    //    .style("stroke-dasharray", 5.5);

    var minx = Infinity;
    var maxx = -Infinity;
    var miny = Infinity;
    var maxy = -Infinity;
    for(var i  = 0; i < data.length; i ++){
        if(data[i][0] > maxx){
            maxx = data[i][0];
        }
        if(data[i][0] < minx && data[i][0] >= 0){
            minx = data[i][0];
        }
        if(data[i][1] > maxy){
            maxy = data[i][1];
        }
        if(data[i][1] < miny && data[i][1] >= 0){
            miny = data[i][1];
        }
    }

    var xAxisWidth = dvplotWidth - padding1.left - padding1.right;
    var xScale = d3.scale.linear()
        .domain([minx, maxx])
        .range([0, xAxisWidth]);

    var yAxisWidth = dvplotHeight - padding1.top - padding1.bottom;
    var yScale = d3.scale.linear()
        .domain([miny, maxy])
        .range([0, yAxisWidth]);

    //画线
    //for(var i=0;i<KNNMatrix.length;i++){
    //    for(var j=1;j<KNNMatrix[0].length;j++){
    //        for(var k=1;k<KNNMatrix[0].length;k++){
    //            if(KNNMatrix[KNNMatrix[i][j]][k]==i){
    //                dvplotSvg.append("line")
    //                    .attr("stroke","gray")
    //                    .attr("stroke-width",0.5)
    //                    .attr("opacity",0.2)
    //                    .attr("x1",padding1.left + xScale(data[i][0]))
    //                    .attr("x2",padding1.left + xScale(data[KNNMatrix[i][j]][0]))
    //                    .attr("y1",dvplotHeight - padding1.bottom - yScale(data[i][1]))
    //                    .attr("y2",dvplotHeight - padding1.bottom - yScale(data[KNNMatrix[i][j]][1]));
    //                break;
    //            }
    //        }
    //    }
    //}

    var circles = dvplotSvg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", function(){
            if(picture){
                return "steelblue";
            }
            return "#E0E0E0";
        })
        .attr("opacity", 0.5)
        .attr("id", function(d, i){
            return "scatterCircle" + i;
        })
        .attr("cx", function (d) {
            if(d[0] < 0){
                return 0;
            }
            else{
                return padding1.left + xScale(d[0]);
            }
        })
        .attr("cy", function (d) {
            if(d[1] < 0){
                return 0;
            }
            else{
                return dvplotHeight - padding1.bottom - yScale(d[1]);
            }
        })
        .attr("r", 4)
        .on("mousemove", function (d, i) {
            plotDetail(i);
            d3.select(this).attr("r", 6);
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("r", 4);
        })
        .on("click", function(d, i){
            if(picture){
                var j = i + 1;
                document.getElementById('scatterPicture' + j).style.display = 'block';
            }
        });
    var positionCircle = [];
    for(var i = 0; i < data.length; i ++){
        var temscalex, temscaley;
        if(data[i][0] < 0){
            temscalex = -1;
        }
        else{
            temscalex = padding1.left + xScale(data[i][0]);
        }
        if(data[i][1] < 0){
            temscaley = -1;
        }
        else{
            temscaley = dvplotHeight - padding1.bottom - yScale(data[i][1]);
        }
        positionCircle.push([temscalex, temscaley]);
    }

    for(var j = 0; j < originData.length; j ++) {
        if (positionCircle[j][0] < 0 || positionCircle[j][1] < 0) {
            d3.select("#scatterCircle" + j).remove();
        }
    }
    alterDrawScatter(positionCircle);
    creatPie(positionCircle);
    if(ScatterFlag % 2) {
        creatYBar(data);
    }
    else {
        creatXBar(data);
    }
    addScatterPicture(positionCircle);
}

function creatPie(positionCircle){
    if(picture){
        return;
    }
    var dataset=[];
    for(var i=0;i<originData[0].length;i++){
        dataset[i]=1;
    }
    var OuterRadius=25;
    var InnerRadius=5;

    var dataset1 = {startAngle : 0, endAngle: 2 * Math.PI};
    var arcPath = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(OuterRadius - 5);
    var pie=d3.layout.pie().sort(null);
    var svg=d3.select("#scatterSvg");
    for(var j = 0; j < originData.length; j ++){
        if(positionCircle[j][0] < 0 || positionCircle[j][1] < 0){
            continue;
        }
        svg.append("path")
            .attr("d", arcPath(dataset1))
            .attr("transform","translate("+positionCircle[j][0]+","+positionCircle[j][1]+")")
            .attr("stroke", "gray")
            .attr("fill", "none");

        var arc=d3.svg.arc()
            .innerRadius(InnerRadius)
            .outerRadius(OuterRadius);
        var arcs=svg.selectAll(".test")
            .data(pie(dataset))
            .enter()
            .append("g")
            .attr("transform","translate("+positionCircle[j][0]+","+positionCircle[j][1]+")");
        var path = arcs.append("path")
            .attr("fill",function(d,i){
                return colorRiver(i);
            })
            .attr("class", function(d, i){
                return "pieClass" + i;
            })
            .attr("d",arc.innerRadius(InnerRadius).outerRadius(function(d,i){
                return InnerRadius + (OuterRadius - InnerRadius - 5) * originData[j][i];
            }))
            .on("mouseover", function(d, i){
                for(var z = 0; z < originData[0].length; z ++) {
                    if(i != z) {
                        d3.selectAll(".pieClass" + z).attr("opacity", 0);
                    }
                }
                plotDetail(i);
            })
            .on("mouseout", function(d, i){
                for(var z = 0; z < originData[0].length; z ++) {
                    d3.selectAll(".pieClass" + z).attr("opacity", 1);
                }
            });
        showBigPie(path, j);
    }
}

function showBigPie(g, index){
    g.on("click", function(){
        d3.select("#drawbigPie").select("svg").remove();
        var width = 340;
        var height = 360;
        var svg = d3.select("#drawbigPie")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        var dataset=[];
        for(var k=0;k<originData[0].length;k++){
            dataset[k]=1;
        }
        var OuterRadius=100;
        var InnerRadius=30;

        var pie=d3.layout.pie().sort(null);
        var arc=d3.svg.arc()
            .innerRadius(InnerRadius)
            .outerRadius(OuterRadius);
        var x = width / 2 - 20;
        var y = height / 2 - 30;

        //画外线和文字
        var outerRadius = 120;
        var arcOut = d3.svg.arc()
            .innerRadius(30)
            .outerRadius(outerRadius);
        var temoutData = pie(dataset);
        var outData = [];
        for(var i = 0; i < temoutData.length; i ++){
            var tem = {startAngle: temoutData[i].startAngle, endAngle: temoutData[i].endAngle};
            outData.push(tem);
        }
        var g_outer = svg.append("g")
            .attr("class", "outG")
            .attr("transform", "translate("+x+","+y+")");
        g_outer.selectAll(".test")
            .data(outData)
            .enter()
            .append("path")
            .attr("d", function(d){
                return arcOut(d)
            })
            //.attr("transform", "translate("+x+","+y+")")
            .attr("fill", "white")
            .attr("stroke", "#cccccc")
            .attr("class", function(d, i){
                return "pieClass" + i;
            })
            .on("mouseover", function(d, i){
                for(var z = 0; z < originData[0].length; z ++) {
                    if(i != z) {
                        d3.selectAll(".pieClass" + z).attr("opacity", 0);
                    }
                }
            })
            .on("mouseout", function(d, i){
                for(var z = 0; z < originData[0].length; z ++) {
                    d3.selectAll(".pieClass" + z).attr("opacity", 1);
                }
            });
        //var angleChange = 90 / columnName.length;
        //g_outer.selectAll(".test")
        //        .data(outData)
        //        .enter()
        //        .append("text")
        //        .each( function(d,i) {
        //            d.angle = (d.startAngle + d.endAngle) / 2;
        //            d.name = columnName[i];
        //        })
        //        .attr("class", function (d, i) {
        //            return "pieClass" + i;
        //        })
        //        .attr("font-size", 10)
        //        .attr("transform", function(d){
        //            return "rotate(" + ( d.angle * 180 / Math.PI - angleChange) + ")" +
        //                   "translate(0,"+ -1.0*(outerRadius+10) +")" ;
        //                    //( ( d.angle > Math.PI*3/4 && d.angle < Math.PI*5/4 ) ? "rotate(180)" : "");
        //        })
        //        .text(function(d){
        //            return d.name;
        //        });
        //g_outer.selectAll(".test")
        //        .data(outData)
        //        .enter()
        //        .append("text")
        //        .each( function(d,i) {
        //            d.angle = (d.startAngle + d.endAngle) / 2;
        //            d.name = originData[index][i].toFixed(4);
        //        })
        //        .attr("class",function (d, i) {
        //            return "pieClass" + i;
        //        })
        //        .attr("font-size", 10)
        //        .attr("transform", function(d){
        //            return "rotate(" + ( d.angle * 180 / Math.PI - angleChange) + ")" +
        //                   "translate(0,"+ -1.0*(outerRadius - 20) +")" ;
        //                    //( ( d.angle > Math.PI*3/4 && d.angle < Math.PI*5/4 ) ? "rotate(180)" : "");
        //        })
        //        .text(function(d){
        //            return d.name;
        //        });

        //画具体
        var arcs=svg.selectAll(".test")
            .data(pie(dataset))
            .enter()
            .append("g")
            .attr("class", "bigPieG")
            .attr("transform","translate("+x+","+y+")");
        arcs.append("path")
            .attr("d",arc.innerRadius(InnerRadius).outerRadius(function(d,i){
                return InnerRadius + (OuterRadius - InnerRadius - 5) * originData[index][i];
            }))
            .attr("fill",function(d,i){
                return colorRiver(i);
            })
            .attr("class", function(d, i){
                return "pieClass" + i;
            })
            .on("mouseover", function(d, i){
                for(var z = 0; z < originData[0].length; z ++) {
                    if(i != z) {
                        d3.selectAll(".pieClass" + z).attr("opacity", 0);
                    }
                }
            })
            .on("mouseout", function(d, i){
                for(var z = 0; z < originData[0].length; z ++) {
                    d3.selectAll(".pieClass" + z).attr("opacity", 1);
                }
            });

        if(picture){
            var j = index + 1;
            document.getElementById('scatterPicture' + j).style.display = 'block';
        }
    });
}
function addPitcure(domain){
    if(!picture){
        return;
    }
    var riverId = "xriverSvg";
    if(ScatterFlag % 2){
        riverId = "yriverSvg";
    }
    for(var i = 0; i < domain.length; i ++) {
        var j = dotPath[i] + 1;
        var svgimg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgimg.setAttributeNS(null, 'height', '35');
        svgimg.setAttributeNS(null, 'width', '35');
        svgimg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', pictureUrl + j + '.bmp');
        if(ScatterFlag % 2){
            svgimg.setAttributeNS(null, 'y', domain[i]);
            svgimg.setAttributeNS(null, 'x', '10');
            if(i == 0){
                svgimg.setAttributeNS(null, 'y', domain[i] - 10);
            }
        }
        else{
            svgimg.setAttributeNS(null, 'x', domain[i]);
            svgimg.setAttributeNS(null, 'y', '150');
            if(i == domain.length - 1){
                svgimg.setAttributeNS(null, 'x', domain[i] - 10);
            }
        }

        svgimg.setAttributeNS(null, 'visibility', 'visible');
        document.getElementById(riverId).appendChild(svgimg);
    }
}
function randomPicture(){
    if(!picture){
        return;
    }
    for(var i = 1; i < originData.length + 1; i ++){
        document.getElementById('scatterPicture' + i).style.display = 'none';
    }
    var num = originData.length * pictureMuch;
    var showNum;
    for(var i = 0; i < num; i ++){
        showNum = Math.floor(Math.random() * originData.length) + 1;
        document.getElementById('scatterPicture' + showNum).style.display = 'block';
    }

}
function addScatterPicture(data){
    if(!picture){
        return;
    }
    for(var i = 0; i < data.length; i ++) {
        var j = i + 1;
        var svgimg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgimg.setAttributeNS(null, 'height', '30');
        svgimg.setAttributeNS(null, 'width', '30');
        svgimg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', pictureUrl + j + '.bmp');
        svgimg.setAttributeNS(null, 'x', data[i][0]);
        svgimg.setAttributeNS(null, 'y', data[i][1]);
        if(data[i][1] + 30 > 650){
            svgimg.setAttributeNS(null, 'y', 620);
        }
        svgimg.setAttributeNS(null, 'visibility', 'visible');
        svgimg.setAttributeNS(null, 'id', 'scatterPicture' + j);
        document.getElementById("scatterSvg").appendChild(svgimg);
        document.getElementById('scatterPicture' + j).style.display = 'none';
    }
    randomPicture();
}

function creatXBar(data1){
    var data = [];
    for(var i = 0; i < data1.length; i ++){
        data.push(data1[i][0]);
    }
    var rectNum = 100;
    var eachNum = [];
    var rectDomain = [];
    for(var i = 0; i < rectNum; i ++){
        eachNum.push(0);
        rectDomain.push(i / rectNum);
    }
    rectDomain.push(2);
    for(var i = 0; i < data.length; i ++){
        for(var j = 0; j < rectNum; j ++){
            if(data[i] >= rectDomain[j] && data[i] < rectDomain[j + 1]){
                eachNum[j] ++;
            }
        }
    }
    var width=600;
    var height=25;
    var padding={left:10, right:10, top:0, bottom:0};
    var svg=d3.select("#xriverSvg");
    var dataset = [].concat(eachNum);
  //x轴的比例尺
    var xScale = d3.scale.linear()
        .domain([0, dataset.length])
        .range([0, width - padding.left - padding.right]);

  //y轴的比例尺
    var yScale = d3.scale.linear()
        .domain([0,d3.max(dataset)])
        .range([0, height]);

    //矩形之间的空白
    var rectPadding = 0;
    var eachWidth = (width - padding.left - padding.right) / rectNum;

    //定义矩形元素
    var rects=svg.selectAll(".MyRect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("transform","translate("+padding.left+","+padding.top+")")
        .attr("x",function(d,i){
            return xScale(i)+rectPadding/2;
        })
        .attr("y",function(d){
            return height-padding.top-padding.bottom-yScale(d);
        })
        .attr("width",eachWidth-rectPadding)
        .attr("height",function(d){
            return yScale(d);
        })
        .attr("fill", function(d, i){
            return "red";
        });
    var lines = [[padding.left, height + 1], [width - padding.right, height + 1]];
    var linePath = d3.svg.line();
    svg.append("path")
        .attr("d", linePath(lines))
        .attr("stroke", "red")
        .attr("stroke-width", "2px");
}
function creatYBar(data1){
    var data = [];
    for(var i = 0; i < data1.length; i ++){
        data.push(data1[i][1]);
    }
    var rectNum = 100;
    var eachNum = [];
    var rectDomain = [];
    for(var i = 0; i < rectNum; i ++){
        eachNum.push(0);
        rectDomain.push(i / rectNum);
    }
    rectDomain.push(2);
    for(var i = 0; i < data.length; i ++){
        for(var j = 0; j < rectNum; j ++){
            if(data[i] >= rectDomain[j] && data[i] < rectDomain[j + 1]){
                eachNum[j] ++;
            }
        }
    }
    var width=25;
    var height=600;
    var padding={left:0, right:0, top:10, bottom:10};
    var svg=d3.select("#yriverSvg");
    var dataset = [].concat(eachNum);
  //x轴的比例尺
    var xScale = d3.scale.linear()
        .domain([0, dataset.length])
        .range([0, height - padding.top - padding.bottom]);

  //y轴的比例尺
    var yScale = d3.scale.linear()
        .domain([0,d3.max(dataset)])
        .range([0, width]);

    //矩形之间的空白
    var rectPadding = 0;
    var eachWidth = (height - padding.top - padding.bottom) / rectNum;

    //定义矩形元素
    dataset.reverse();
    var rects=svg.selectAll(".MyRect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("transform","translate("+padding.left+","+padding.top+")")
        .attr("x",180 - width)
        .attr("y",function(d, i){
            return xScale(i)+rectPadding/2;
        })
        .attr("width",function(d,i){
            return yScale(d);
        })
        .attr("height",eachWidth)
        .attr("fill", "green");
    var lines = [[180 - width - 1, padding.top], [180 - width - 1, height - padding.bottom]];
    var linePath = d3.svg.line();
    svg.append("path")
        .attr("d", linePath(lines))
        .attr("stroke", "green")
        .attr("stroke-width", "2px");
}
//计算选取的两点之间的最短距离，返回索引及距离
function ShortDistance(Start,End) {
    var PointNum=originData.length;//顶点数目
    var Point=[];//最短路径内的点
    var OrderPoint=[];//按顺序最短路径内的点
    var OrderPointC=[];//按顺序最短路径内的点包括最后一个点
    var BetweenDis=[];//最短路径内的点之间的距离

    var distance=[];//记录从source到其他节点的最短距离
    var path=[];//记录在最短路径中，当前节点的父节点
    var flag=[];//记录一个节点是否被访问过

    for(var i=0;i<PointNum;i++){
        distance[i]=0;//初始化
        path[i]=Start;
        flag[i]=0;
    }
    for(var i=0;i<PointNum;i++){
        distance[i]=WeightMatrix[Start][i];
    }
    flag[Start]=1;//起点被访问过
    distance[Start]=0;//到自身的距离为0

    for(var i=0;i<PointNum-1;i++){
        var index = -1;
        var min=Infinity;
        for(var j=0;j<PointNum;j++){
            if(flag[j]==0&&distance[j]<min){
                index=j;
                min=distance[j];
            }
        }
        if(index == -1){
            break;
        }
        flag[index]=1;
        //修正其他节点到source的最短距离
        for(var j=0;j<PointNum;j++){
            if(flag[j]==0&&(min+WeightMatrix[index][j])<distance[j]){
                distance[j]=min+WeightMatrix[index][j];
                path[j]=index;
            }
        }
    }
    var temp=End;
    Point.push(End);
    while(path[temp]!=Start){
        Point.push(path[temp]);
        temp=path[temp];
    }
    Point.push(Start);
    for(var i=Point.length-1;i>0;i--){
        OrderPoint.push(Point[i]);
    }
    for(var i=Point.length-1;i>=0;i--){
        OrderPointC.push(Point[i]);
    }
    for(var i=0;i<OrderPointC.length-1;i++){
        BetweenDis.push(WeightMatrix[OrderPointC[i]][OrderPointC[i+1]])
    }
    return [OrderPoint,BetweenDis];
}

//高亮选取点的最短路径
function edges_link(data, flag, path, fixpindex) {
    //获得需要经过的nodes（有x y坐标）
    ScatterFlag = flag;//为了防止异步的错误
    dotPath = path;

    d3.selectAll(".overClass").remove();
    var dot_red = [];
    var svg = d3.select("#svg1");
    var classLine = "xChooseLine";
    var classPoint = "xChoosePoint";
    var classClickPoint = "xClickPoint";
    var dragPointClass = "xDragChoosePoint";
    var dragLineClass = "xDragChooseLine";
    var dragPointClass1 = "yDragChoosePoint";
    var dragLineClass1 = "yDragChooseLine";
    if(ScatterFlag % 2 != 0){
        classLine = "yChooseLine";
        classPoint = "yChoosePoint";
        classClickPoint = "yClickPoint";
        dragPointClass = "yDragChoosePoint";
        dragLineClass = "yDragChooseLine";
        dragPointClass1 = "xDragChoosePoint";
        dragLineClass1 = "xDragChooseLine";
    }
    if(!document.getElementsByClassName("xChoosePoint").length && !document.getElementsByClassName("yChoosePoint").length){
        if(!document.getElementsByClassName("xDragChoosePoint").length){
            svg.selectAll("." + "yDragChoosePoint")
                .attr("class", dragPointClass1);
            svg.selectAll("." + "yDragChooseLine")
                .attr("class", dragLineClass1);
        }
        if(!document.getElementsByClassName("yDragChoosePoint").length){
            svg.selectAll("." + "xDragChoosePoint")
                .attr("class", dragPointClass1);
            svg.selectAll("." + "xDragChooseLine")
                .attr("class", dragLineClass1);
        }
    }
    var delclass = document.getElementsByClassName(dragPointClass);
    if(delclass.length){
        var delindex = parseInt(delclass[0].getAttribute("id"));
        svg.selectAll("." + dragPointClass)
            .attr("class", "beforeDragPoint" + delindex)
            .attr("fill", "gray")
            .attr("r", 6);
        svg.selectAll("." + dragLineClass)
            .attr("class", "beforeDragLine" + delindex)
            .attr("stroke", "gray")
            .attr("stroke-width", 3);
    }

    svg.selectAll("." + classLine)
        .remove();
    svg.selectAll("." + classPoint)
        .remove();
    svg.selectAll("." + classClickPoint)
        .attr("class", "normalClass");

    if(fixpindex >= 0){
        var exi = svg.selectAll("." + "beforeDragPoint" + fixpindex);
        if(exi[0].length) {
            exi.attr("class", dragPointClass);
            svg.selectAll("." + "beforeDragLine" + fixpindex)
                .attr("class", dragLineClass);
            return;
        }
        exi = document.getElementsByClassName(dragPointClass1);
        if(exi.length){
            if(fixpindex == parseInt(exi[0].getAttribute("id"))){
                svg.selectAll("." + dragPointClass1)
                    .attr("class", dragPointClass);
                svg.selectAll("." + dragLineClass1)
                    .attr("class", dragLineClass);
                return;
            }
        }
    }
    for (var i = 0; i < dotPath.length; i++) {
        dot_red.push(nodes[dotPath[i]]);
    }
    var temid = fixpindex;
    if(fixpindex == -1) {
        temid = fixPoint.length - 1;
    }
    for(var i = 0;i<dot_red.length-1;i++){
        var line = svg.append("line")
            .attr("id", temid + "dragLine" + i)
            .attr("class", classLine)
            .attr("x1",dot_red[i].x)
            .attr("y1",dot_red[i].y)
            .attr("x2",dot_red[i+1].x)
            .attr("y2",dot_red[i+1].y)
            .attr()
        clickLine(line, data, i, flag, temid);
        mouseline(line,i,classLine);
    }

    for(var i = 0;i<dot_red.length;i++){
        var point = svg.append("circle")
            .attr("cx", dot_red[i].x)
            .attr("cy", dot_red[i].y)
            .attr("class", classPoint)
            .attr("id", temid + "dragPoint" + i);
            mousePoint(point, dotPath[i], flag, temid, i, classPoint);
    }
    d3.select('#svg1').selectAll("*")
        .attr("transform", "translate(" + nowTran + ")" + "scale(" + nowScale + ")");
    var move = [0, 0];
    var sc = 1;
    d3.selectAll("#alterPath")
        .attr("transform", "translate(" + move + ")" + "scale(" + sc + ")");
    d3.selectAll("#markPath")
        .attr("transform", "translate(" + move + ")" + "scale(" + sc + ")");
    changeR();
    isConnect();
}

//检查是否有环路
function isConnect(){
    var t = 1;
    var change = 0;
    while (t) {
        t = 0;
        for (var i = dotPath.length - 1; i >= 0; i--) {
            var deleIndex = dotPath.indexOf(dotPath[i]);
            if (deleIndex != i) {
                dotPath.splice(deleIndex + 1, i - deleIndex);
                t = 1;
                change = 1;
                break;
            }
        }
    }
    if (change) {
        var index1 = savePath.length - 1;
        savePath.splice(index1, 1);
        saveDis.splice(index1, 1);
        saveY.splice(index1, 1);
        fixPoint.splice(index1, 1);
        var obj = document.getElementById("selectxAxis");
        var obj2 = document.getElementById("selectyAxis");
        obj.options.remove(index1 + 1);
        obj2.options.remove(index1 + 1);

        dotDist = [];
        for (var i = 0; i < dotPath.length - 1; i++) {
            dotDist[i] = getEDistance(dotPath[i], dotPath[i + 1]);
        }
        reView(-1);
        SavePath();
    }
}

function fixOverlap(){
    fixOverPoint = [];
    visitOver = [];
    for(var i = 0; i < fixPoint.length; i ++) {
        visitOver.push(0);
    }
    var flag = 0;
    for(var i = 0; i < fixPoint.length; i ++){
        if(!fixPoint[i].length){
            continue;
        }
        for(var j = i + 1; j < fixPoint.length; j ++){
            if(!fixPoint[j].length){
                continue;
            }
            for(var z = 0; z < fixPoint[i].length; z ++){
                for(var k = 0; k < fixPoint[j].length; k ++){
                    if(fixPoint[i][z][0] == fixPoint[j][k][0]){
                        fixOverPoint.push([i, j, z, k]);
                        flag = 1;
                        break;
                    }
                }
                if(flag){
                    flag = 0;
                    break;
                }
            }
        }
    }
}

function clickLine(line, data, m, scaflag, index){
    line.on("click", function() {
        if(vanalysis) {
            var svg1 = d3.select("#svg1");
            var svg2 = d3.select("#scatterSvg");
            svg1.selectAll(".yellowClass")
                .attr("class", "normalClass");
            svg2.selectAll(".yellowClass")
                .attr("class", "normalClass");
            leftPoint.attr("class", "leftPoint");
            var xchoose = svg1.selectAll(".xChoosePoint");
            var ychoose = svg1.selectAll(".yChoosePoint");
            for (var j = 0; j < data.length; j++) {
                if (m == data[j]) {
                    svg1.select("#forceCircle" + j)
                        .attr("class", "yellowClass");
                    svg2.select("#scatterCircle" + j)
                        .attr("class", "yellowClass");
                }
            }
            xchoose.attr("class", "xChoosePoint");
            ychoose.attr("class", "yChoosePoint");
        }
        else if(vdetatch){
            fixPoint[index] = [];
            d3.selectAll(".beforeDragPoint" + index).remove();
            d3.selectAll(".beforeDragLine" + index).remove();
            var detatchClass = d3.select(this)[0][0].className.animVal;
            if(detatchClass == "xDragChooseLine"){
                d3.selectAll(".xDragChooseLine")
                    .attr("class", "xChooseLine");
                d3.selectAll(".xDragChoosePoint")
                    .attr("class", "xChoosePoint");
            }
            else if(detatchClass == "yDragChooseLine"){
                d3.selectAll(".yDragChooseLine")
                    .attr("class", "yChooseLine");
                d3.selectAll(".yDragChoosePoint")
                    .attr("class", "yChoosePoint");
            }
            else if(detatchClass == "xChooseLine" || detatchClass == "yChooseLine"){
                return;
            }
            force.start();
        }
        else if(vlayout) {
            if(d3.select(this)[0][0].className.animVal != "xChooseLine" && d3.select(this)[0][0].className.animVal != "yChooseLine"){
                return;
            }
            var dragpid = d3.select(this)[0][0].id;
            var valueIndex = parseInt(dragpid);

            dotPath = savePath[valueIndex];
            var tems = 0;
            var dist = [];
            dist.push(0);
            for (var i = 0; i < dotPath.length - 1; i++) {
                tems = Math.sqrt(Math.pow(nodes[dotPath[i]].x - nodes[dotPath[i + 1]].x, 2) + Math.pow(nodes[dotPath[i]].y - nodes[dotPath[i + 1]].y, 2));
                dist.push(tems);
            }
            var s = 0;
            var temFixPoint = [];
            var repointClassName = "xDragChoosePoint";
            var relineClassName = "xDragChooseLine";
            if (scaflag % 2) {
                repointClassName = "yDragChoosePoint";
                relineClassName = "yDragChooseLine";
            }
            var angleArry = angleFunction(nodes[dotPath[0]].x, nodes[dotPath[0]].y, nodes[dotPath[dotPath.length - 1]].x, nodes[dotPath[dotPath.length - 1]].y)
            var angle = angleArry[0];
            for (var i = 0; i < dotPath.length; i++) {
                s += dist[i];
                var dragpx = nodes[dotPath[0]].x + s * Math.cos(angle);
                var dragpy = nodes[dotPath[0]].y + s * Math.sin(angle);
                temFixPoint.push([dotPath[i], dragpx, dragpy]);
                var temid = document.getElementById(valueIndex + "dragPoint" + i);
                temid.setAttribute("cx", dragpx);
                temid.setAttribute("cy", dragpy);
                temid.setAttribute("class", repointClassName);
                var j = i - 1;
                if (i == dotPath.length - 1) {
                    temid = document.getElementById(valueIndex + "dragLine" + j);
                    temid.setAttribute("x2", dragpx);
                    temid.setAttribute("y2", dragpy);
                    temid.setAttribute("class", relineClassName);
                    continue;
                }
                temid = document.getElementById(valueIndex + "dragLine" + i);
                temid.setAttribute("x1", dragpx);
                temid.setAttribute("y1", dragpy);
                if (j < 0) {
                    continue;
                }
                temid = document.getElementById(valueIndex + "dragLine" + j)
                temid.setAttribute("x2", dragpx);
                temid.setAttribute("y2", dragpy);
                temid.setAttribute("class", relineClassName);
            }
            fixPoint[valueIndex] = temFixPoint;
            force.start();
            fixOverlap();
            dragLine(valueIndex);
            dragPoint(valueIndex);
        }
        else if(vdeleteLine) {
            var detatchClass = d3.select(this)[0][0].className.animVal;
            if (detatchClass == "xDragChooseLine" || detatchClass == "xChooseLine") {
                deletPath(2);
            }
            else if (detatchClass == "yDragChooseLine" || detatchClass == "yChooseLine") {
                deletPath(3);
            }
            else {
                d3.selectAll(".beforeDragPoint" + index).remove();
                d3.selectAll(".beforeDragLine" + index).remove();
                var obj = document.getElementById("selectxAxis");
                var obj2 = document.getElementById("selectyAxis");
                obj.options.remove(index + 1);
                obj2.options.remove(index + 1);
                deletDrag(index);
            }
        }
        else{

        }
    });
}
function mouseline(line,i,classLine){
    line.on("mouseover",function(d){
            if(vanalysis) {
                if (classLine == "xChooseLine") {
                    d3.select("#xriverRect" + i).style("opacity", 0.4);
                }
                else {
                    d3.select("#yriverRect" + i).style("opacity", 0.4);
                }
            }
            d3.select(this)
                .style("stroke-width", 5);
        })
    .on("mouseout",function(d){
        if(vanalysis) {
            if (classLine == "xChooseLine") {
                d3.select("#xriverRect" + i).style("opacity", 0);
            }
            else {
                d3.select("#yriverRect" + i).style("opacity", 0);
            }
        }
        d3.select(this)
            .style("stroke-width", 3);
    });
}
function mousePoint(point, Dataindex, scaflag, index, ii, laPointClass){
    point.on("mouseover",function(d){
            if(vanalysis) {
                if(laPointClass == "xChoosePoint") {
                    d3.select("#xriverLine" + ii)
                        .style("opacity", 1)
                }
                else{
                    d3.select("#yriverLine" + ii)
                        .style("opacity", 1)
                }
            }
            plotDetail(Dataindex);
            d3.select(this)
                .style("r", 8 / nowScale);

        })
        .on("mouseout",function(d){
            if(vanalysis) {
                if(laPointClass == "xChoosePoint") {
                    d3.select("#xriverLine" + ii)
                        .style("opacity", 0)
                }
                else{
                    d3.select("#yriverLine" + ii)
                        .style("opacity", 0)
                }
            }
            d3.select(this)
                .style("r", 6 / nowScale);
        })
        .on("click", function(d){
            if(vlayout) {
                if(d3.select(this)[0][0].className.animVal != "xChoosePoint" && d3.select(this)[0][0].className.animVal != "yChoosePoint"){
                    return;
                }
                var dragpid = d3.select(this)[0][0].id;
                var valueIndex = parseInt(dragpid);

                dotPath = savePath[valueIndex];
                var tems = 0;
                var dist = [];
                dist.push(0);
                for (var i = 0; i < dotPath.length - 1; i++) {
                    tems = Math.sqrt(Math.pow(nodes[dotPath[i]].x - nodes[dotPath[i + 1]].x, 2) + Math.pow(nodes[dotPath[i]].y - nodes[dotPath[i + 1]].y, 2));
                    dist.push(tems);
                }
                var s = 0;
                var temFixPoint = [];
                var repointClassName = "xDragChoosePoint";
                var relineClassName = "xDragChooseLine";
                if (scaflag % 2) {
                    repointClassName = "yDragChoosePoint";
                    relineClassName = "yDragChooseLine";
                }
                var angleArry = angleFunction(nodes[dotPath[0]].x, nodes[dotPath[0]].y, nodes[dotPath[dotPath.length - 1]].x, nodes[dotPath[dotPath.length - 1]].y)
                var angle = angleArry[0];
                for (var i = 0; i < dotPath.length; i++) {
                    s += dist[i];
                    var dragpx = nodes[dotPath[0]].x + s * Math.cos(angle);
                    var dragpy = nodes[dotPath[0]].y + s * Math.sin(angle);
                    temFixPoint.push([dotPath[i], dragpx, dragpy]);
                    var temid = document.getElementById(valueIndex + "dragPoint" + i);
                    temid.setAttribute("cx", dragpx);
                    temid.setAttribute("cy", dragpy);
                    temid.setAttribute("class", repointClassName);
                    var j = i - 1;
                    if (i == dotPath.length - 1) {
                        temid = document.getElementById(valueIndex + "dragLine" + j);
                        temid.setAttribute("x2", dragpx);
                        temid.setAttribute("y2", dragpy);
                        temid.setAttribute("class", relineClassName);
                        continue;
                    }
                    temid = document.getElementById(valueIndex + "dragLine" + i);
                    temid.setAttribute("x1", dragpx);
                    temid.setAttribute("y1", dragpy);
                    if (j < 0) {
                        continue;
                    }
                    temid = document.getElementById(valueIndex + "dragLine" + j)
                    temid.setAttribute("x2", dragpx);
                    temid.setAttribute("y2", dragpy);
                    temid.setAttribute("class", relineClassName);
                }
                fixPoint[valueIndex] = temFixPoint;
                fixOverlap();
                var position = -1;
                for(var i = 0; i < fixOverPoint.length; i ++){
                    if(fixOverPoint[i][0] == valueIndex){
                        position = fixOverPoint[i][2];
                    }
                    else if(fixOverPoint[i][1] == valueIndex){
                        position = fixOverPoint[i][3];
                    }
                    else{
                        continue;
                    }
                    var movex = fixPoint[valueIndex][position][1] - nodes[dotPath[position]].x;
                    var movey = fixPoint[valueIndex][position][2] - nodes[dotPath[position]].y;
                    updateLine(valueIndex, movex, movey, 0);
                    break;
                }
                force.start();
                dragLine(valueIndex);
                dragPoint(valueIndex);
            }
            else if(vdetatch){
                fixPoint[index] = [];
                d3.selectAll(".beforeDragPoint" + index).remove();
                d3.selectAll(".beforeDragLine" + index).remove();
                var detatchClass = d3.select(this)[0][0].className.animVal;
                if(detatchClass == "xDragChoosePoint"){
                    d3.selectAll(".xDragChooseLine")
                        .attr("class", "xChooseLine");
                    d3.selectAll(".xDragChoosePoint")
                        .attr("class", "xChoosePoint");
                }
                else if(detatchClass == "yDragChoosePoint"){
                    d3.selectAll(".yDragChooseLine")
                        .attr("class", "yChooseLine");
                    d3.selectAll(".yDragChoosePoint")
                        .attr("class", "yChoosePoint");
                }
                else if(detatchClass == "xChoosePoint" || detatchClass == "yChoosePoint"){
                    return;
                }
                force.start();
            }
            else if(vdeleteLine) {
                var detatchClass = d3.select(this)[0][0].className.animVal;
                if (detatchClass == "xDragChoosePoint" || detatchClass == "xChoosePoint") {
                    deletPath(2);
                }
                else if (detatchClass == "yDragChoosePoint" || detatchClass == "yChoosePoint") {
                    deletPath(3);
                }
                else {
                    d3.selectAll(".beforeDragPoint" + index).remove();
                    d3.selectAll(".beforeDragLine" + index).remove();
                    var obj = document.getElementById("selectxAxis");
                    var obj2 = document.getElementById("selectyAxis");
                    obj.options.remove(index + 1);
                    obj2.options.remove(index + 1);
                    deletDrag(index);
                }
            }
            else if(vfreeSketch){
                var classPoint = "red";
                if(ScatterFlag % 2 == 0){
                    classPoint = "green";
                }
                d3.select("#svg1")
                    .append("circle")
                    .attr("cx", nodes[Dataindex].x)
                    .attr("cy", nodes[Dataindex].y)
                    .attr("fill", classPoint)
                    .attr("r", 8 / nowScale)
                    .attr("class", "overClass")
                    .attr("transform", "translate(" + nowTran + ")" + "scale(" + nowScale + ")")
                    .on("click", function(){
                        d3.select(this).remove();
                        deltDetail(Dataindex);
                    })
                    .on("mousemove", function(){
                        plotDetail(Dataindex);
                        d3.select(this)
                            .style("r", 8 / nowScale);
                    });
                memDetail(Dataindex);
                plotDetail(Dataindex);//细节
            }
        })
        .on("dblclick", function (d,i) {
        });
}

//选取点后进行投影绘制等操作
function dotSelect(){
    //1、选取路径存到dotPath里
    //console.log(dotIndex);
    //console.log(dotIndex.length);
    var vec = [];
    WeightMatrix = [];
    for(var i=0;i<realWeight.length;i++) {
        for (var j = 0; j < realWeight.length; j++) {
            vec.push(realWeight[i][j]);
        }
        WeightMatrix.push(vec);
        vec = [];
    }
    var connectMax = Math.max.apply(null, connectZone);
    for(var i = 0;i < dotIndex.length-1;i++){
        if(connectZone[dotIndex[i]] != connectZone[dotIndex[i + 1]]){
            var minIndex = Math.min(connectZone[dotIndex[i]], connectZone[dotIndex[i + 1]]);
            var maxIndex = Math.max(connectZone[dotIndex[i]], connectZone[dotIndex[i + 1]]);
            var distanceIndex = 0;
            for(var j = 0; j < minIndex; j ++){
                distanceIndex += connectMax - j;
            }
            distanceIndex +=  maxIndex - minIndex - 1;
            WeightMatrix[zoneDistance[distanceIndex][1]][zoneDistance[distanceIndex][2]] = zoneDistance[distanceIndex][0];
            WeightMatrix[zoneDistance[distanceIndex][2]][zoneDistance[distanceIndex][1]] = zoneDistance[distanceIndex][0];
        }
    }
    dotPath=[];
    dotDist = [];

    ScatterFlag=ScatterFlag+1;
    for(var i = 0;i < dotIndex.length-1;i++){
        var path=[];
        var dist=[];
        [path,dist] = ShortDistance(dotIndex[i],dotIndex[i+1]);

        for(var j = 0;j<path.length;j++) {
            dotPath.push(path[j]); //需要的路径
        }
        for(var j=0;j<dist.length;j++){
            dotDist.push(dist[j]);//路径线段之间的距离
        }
    }
    dotPath.push(dotIndex[dotIndex.length-1]);
    reView(-1);
    SavePath();
}