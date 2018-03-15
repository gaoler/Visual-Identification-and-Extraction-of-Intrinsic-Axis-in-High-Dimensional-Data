/**
 * Created by iris on 2016/11/11.
 */

//响应change按钮
function changeData(){
    //projection1();
    hide();//在数据生成前使屏幕变灰
    InitSystem();
    k_near = document.getElementById("k_value").value;
    g_value = document.getElementById("g_value").value;
    r_value = document.getElementById("r_value").value;
    opacity = document.getElementById("opacity").value;
    var dataName = document.getElementById("selectData").value;
    //readGDdistance(dataName);//读取数据,需要测地距离
    loadData(dataName);
}

function hide(){
    var hidebg=document.getElementById("hide");
    hidebg.style.display="block";  //显示隐藏层
    hidebg.style.height=document.body.clientHeight+"px";  //设置隐藏层的高度为当前页面高度
    //document.getElementById("hidebox").style.display="block";  //显示弹出层
}

//初始化全局变量
function InitSystem(){
    //清屏
    d3.selectAll("svg").remove();
    //清楚保存路径的下拉框
    document.getElementById("selectxAxis")
        .options.length = 0;
    document.getElementById("selectyAxis")
        .options.length = 0;
    d3.select("#selectxAxis")
        .append("option")
        .text("none")
        .attr("selected","true");
    d3.select("#selectyAxis")
        .append("option")
        .text("none")
        .attr("selected","true");


    originData = [];   //原始数据

    k_near = 0;//k近邻
    g_value = 0;//力导向图的重力
    opacity = 0;//力导向图线的透明度
    r_value = 0;//力导向图的斥力
    nodes = [];//力导向图点的位置
    edges = [];//力导向图边

    //knn矩阵
    KNNDistMatrix = [];
    KNNMatrix = [];
    WeightMatrix = new Array();
    realWeight = [];
    //路径
    savePath = [];
    saveDis = [];
    saveChoose = [];
    saveY = [];
    dotIndex = [];
    dotPath = [];
    dotDist = [];
    //画散点图
    scatterX = [];
    scatterY = [];
    ScatterFlag = -1;

    //保存到下拉框的显示名称
    newxAxisname="Axis - ";
    newyAxisname="Axis - ";
    AxisIndex = 0;

    //当前屏幕的缩放比例
    nowScale = 1;
    nowTran = [0, 0];

    //测试
    everyEdistance = [];
    gdDistance = [];
    whichReduce = 0;

    //没有投影的点
    leftPoint = [];

    //不连通区域
    connectZone = [];
    zoneDistance = [];

    //力导向图上不变的点
    fixPoint = [];
    fixOverPoint = [];
    visitOver = [];
    //初始化按钮
    initButton();
    vfreeSketch = 1;

    columnName = [];//列名
    originLabel =[];//标签

    //当前力导向图的尺寸
    sizeForce = {minx:Infinity, maxx:-Infinity, miny:Infinity, maxy:-Infinity};
    onlyOneForce = 1;
    //搜索点的索引
    serchPointId = 0;

    //河流图显示维度信息
    tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0.0);

    //获取搜索值和详细信息
    document.getElementById('data_index').value = "";
    document.getElementById('details').innerHTML = "";



    //显示图像
    picture = 0;//是否显示图像
    //pictureUrl = '../static/data/Vis/piture/face/face';
    pictureUrl = '../static/data/Vis/piture/mixture/mnist';
    pictureMuch = 0;//显示图像的多少

    //河流图的颜色比例尺
    colorRiver = d3.scale.category20();
    //colorRiver = [d3.rgb(1, 176, 92), "#FF6600", d3.rgb(22, 56, 91), "#FF33CC", d3.rgb(116, 50, 154),
    //            d3.rgb(1, 113, 187), d3.rgb(255, 30, 25), "#CC6600", "#9933CC", "#009999", "#0000FF", "#663300", "#336633"];
}

//读取测地距离
function readGDdistance(dataName){
    var selsect = document.getElementById("selectData");
    var name = selsect.options[selsect.selectedIndex ].text;
    var gdName = "../static/data/Vis/gd/" + name + ".csv";
    var csv = d3.dsv(",", "text/csv;charset=gb2312");
    csv(gdName, function (error, data) {
        if (error) throw error;
        var vec = [];
        for (var i in data) {
            for (var j in data[i]) {
                vec.push(parseFloat(data[i][j]));
            }
            gdDistance.push(vec);
            vec = [];
        }
        for(var i = 0; i < gdDistance.length; i ++){
            var max = d3.max(gdDistance[i]);
            var min = d3.min(gdDistance[i]);
            if(max - min == 0){
                for(var j = 0; j < gdDistance[i].length; j ++){
                    gdDistance[i][j] = 0;
                }
                continue;
            }
            for(var j = 0; j < gdDistance[i].length; j ++){
                gdDistance[i][j] = (gdDistance[i][j] - min) / (max - min);
            }
        }
        loadData(dataName);
    });
}
//得到所有点之间的欧式距离并且归一化
function getEveryEDistance(){
    var vec = [0];
    for(var i = 0; i < originData.length; i ++){
        for(var j = i + 1; j < originData.length; j ++){
            vec.push(getEDistance(i, j));
        }
        everyEdistance.push(vec);
        vec = [];
        for(var z = 0; z < i + 1; z ++){
            vec.push(everyEdistance[z][i + 1]);
        }
        vec.push(0);
    }
    for(var i = 0; i < everyEdistance.length; i ++){
        var max = d3.max(everyEdistance[i]);
        var min = d3.min(everyEdistance[i]);
        if(max - min == 0){
            for(var j = 0; j < everyEdistance[i].length; j ++){
                everyEdistance[i][j] = 0;
            }
            continue;
        }
        for(var j = 0; j < everyEdistance[i].length; j ++){
            everyEdistance[i][j] = (everyEdistance[i][j] - min) / (max - min);
        }
    }
}

//计算KNN值
function caculateKNN(data,knn){

    var KNNMatrix = [];  ////存储了离第i个节点最近的k个结点
    var KNNDistMatrix = []; //存储了离第i个节点最近的k个结点与它之间的距离

    var dataR = data.length;
    var dataC = data[0].length;

    for(var i = 0;i < dataR;i++){
        var distanceMatrix = [];
        for(var j = 0;j < dataR;j++){
            if(i != j) {
                var distanceVector = [];
                var quarsum = 0;
                var distance = 0;
                //计算两个点之间的距离
                for (var k = 0; k < dataC; k++) {
                    quarsum += Math.pow(data[i][k] - data[j][k], 2);
                }
                distance = Math.sqrt(quarsum);  //计算得到点i和j之间的距离
                distanceVector.push(distance);
                distanceVector.push(i);
                distanceVector.push(j);
                distanceMatrix.push(distanceVector);
            }
        }
        //对距离矩阵进行排序
        distanceMatrix.sort(function(x,y){
            return x[0] - y[0];
        });

        var KNNList = [];
        var KNNDist = [];
        KNNDist.push(i);
        KNNList.push(i);
        //save the result
        for(var u = 0;u < knn;u++){
            KNNList.push(distanceMatrix[u][2]);
            KNNDist.push(distanceMatrix[u][0]);
        }
        KNNMatrix.push(KNNList);
        KNNDistMatrix.push(KNNDist);
    }

    for(var i=0;i<KNNMatrix.length;i++)
    {
        WeightMatrix[i]=new Array();
    }
    for(var i=0;i<KNNMatrix.length;i++){
        for(var j=0;j<KNNMatrix.length;j++){
            WeightMatrix[i][j]=Infinity;//赋值为Infinity时认为距离为无穷大
        }
    }
    //有向图
    //for(var i=0;i<KNNMatrix.length;i++){
    //    for(var j=1;j<KNNMatrix[0].length;j++){
    //        WeightMatrix[i][KNNMatrix[i][j]]=KNNDistMatrix[i][j];
    //        WeightMatrix[i][i]=0;
    //    }
    //}
    //for(var i = 0; i < originData.length; i ++){
    //    dijkstra(i);
    //}

    //存在邻居就都有边
    //for(var i=0;i<KNNMatrix.length;i++){
    //    for(var j=1;j<KNNMatrix[0].length;j++){
    //        WeightMatrix[i][KNNMatrix[i][j]]=KNNDistMatrix[i][j];
    //        WeightMatrix[KNNMatrix[i][j]][i]=KNNDistMatrix[i][j];
    //    }
    //    WeightMatrix[i][i] = 0;
    //}


    //都存在邻居才有边
    for(var i=0;i<KNNMatrix.length;i++){
        for(var j=1;j<KNNMatrix[0].length;j++){
            for(var z = 1; z < KNNMatrix[0].length; z ++){
                if(KNNMatrix[KNNMatrix[i][j]][z] == i){
                    WeightMatrix[i][KNNMatrix[i][j]]=KNNDistMatrix[i][j];
                    WeightMatrix[KNNMatrix[i][j]][i]=KNNDistMatrix[i][j];
                    break;
                }
            }
        }
        WeightMatrix[i][i] = 0;
    }

    var vec = [];
    for(var i=0;i<KNNMatrix.length;i++) {
        for (var j = 0; j < KNNMatrix.length; j++) {
            vec.push(WeightMatrix[i][j]);
        }
        realWeight.push(vec);
        vec = [];
    }
    getConnectZone();
    return [KNNMatrix,KNNDistMatrix];
}

//在力引导图上点击点后，在信息栏中显示这个数据点的具体信息
function plotDetail(index) {
    var Dimension = originData[0].length;

    var DetailVec = [];  //用于存储细节标签
    DetailVec.push(originData[index]);

    d3.select("#details").select("svg").remove();
    var svg = d3.select("#details")
        .append("svg")
        .style("height", 30 * originData[0].length)
        .style("width", 335);

    for(var i = 0;i < Dimension ; i++){
        svg.append("rect")
            //.attr("")
            .attr("width", 20)
            .attr("height", 10)
            .attr("class", "pieClass" + i)
            .attr("fill", colorRiver(i))
            .attr("transform", "translate(10, "+ ((i + 1) * 30 - 10) +")");
        var datails = originData[index][i];
        //all_detail = all_detail + columnName[i] + ":" + "&nbsp;" + datails.toFixed(4) + "<br>";
        var txt = svg.append("text")
            .text(columnName[i] + ": " + datails.toFixed(4))
            .attr("class", "pieClass" + i)
            .attr("transform", "translate(35, "+ (i + 1) * 30 +")");
        mouseText(txt, i);
    }
    //显示细节
    document.getElementById('data_index').value = originLabel[index];
}

function mouseText(txt, index) {
    txt.on("mouseover", function(){
        d3.select(this).attr("cursor", "pointer");
        //d3.select(this).attr("fill", "red");
            for(var z = 0; z < originData[0].length; z ++) {
                if(index != z) {
                    d3.selectAll(".pieClass" + z).attr("opacity", 0);
                }
            }
        })
        .on("mouseout", function(){
            d3.select(this).attr("fill", "black");
            for(var z = 0; z < originData[0].length; z ++) {
                d3.selectAll(".pieClass" + z).attr("opacity", 1);
            }
        });
}

//记录选取的点
function memDetail(index){
    dotIndex.push(index);
    if(dotIndex.length >= 2){
        document.getElementById("drawChoosePointId").style.opacity=buttonOpricy2;
    }
}
function deltDetail(index){
    dotIndex.splice(dotIndex.indexOf(index), 1);
}

function getEDistance(index1, index2){
    var s = 0;
    for(var i = 0; i < originData[0].length; i ++){
        s += Math.pow((originData[index1][i] - originData[index2][i]), 2);
    }
    return Math.sqrt(s);
}

//绘制力导引图
function drawForceDirected() {
    var width = 600;
    var height = 600;

    var svg = d3.select("#pvPlot")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("id","svg1")
        .on("mouseover", function(){
            for(var i = 0; i < 2; i ++) {
                var riverName = 'xriverRect';
                if(i){
                    riverName = 'yriverRect';
                }
                var t = 0;
                while (1) {
                    var tei = document.getElementById(riverName + t);
                    t++;
                    if (tei != null) {
                        tei.style.display = 'block';
                    }
                    else {
                        break;
                    }
                }
            }
        })
        .on("mouseout", function(){
            for(var i = 0; i < 2; i ++) {
                var riverName = 'xriverRect';
                if(i){
                    riverName = 'yriverRect';
                }
                var t = 0;
                while (1) {
                    var tei = document.getElementById(riverName + t);
                    t++;
                    if (tei != null) {
                        tei.style.display = 'none';
                    }
                    else {
                        break;
                    }
                }
            }
        });

    ffreeSketch();
    dataZoom();

    var tempvisit1 = [];
    var tempvisit2 = [];
    for (var i = 0; i < KNNMatrix.length; i++) {
        var n = {name: i.toString()};
        nodes.push(n);
        tempvisit1.push(0);
    }

    var visit = [];
    for (var i = 0; i < KNNMatrix.length; i++) {
        tempvisit2 = [];
        tempvisit2 = tempvisit1.slice(); //0 0 0 0
        for (var j = 1; j < KNNMatrix[0].length; j++) {
            tempvisit2[KNNMatrix[i][j]] = 1;
        }
        visit.push(tempvisit2);
    }
    //for (var i = 0; i < KNNMatrix.length; i++) {//单个
    //    for (var j = 0; j < KNNMatrix.length; j++) {
    //        if (visit[i][j] == 1)
    //        {
    //            var e = {source: i, target: j}; //
    //            edges.push(e);
    //            visit[i][j] = 2;
    //        }
    //    }
    //}
    for (var i = 0; i < KNNMatrix.length; i++) {//同时
        for (var j = 0; j < KNNMatrix.length; j++) {
            if (visit[i][j] == 1 && visit[j][i] == 1) {
                var e = {source: i, target: j};
                edges.push(e);
                //var e1 = {source :j, target : i};
                //edges.push(e1);
                visit[i][j] = 2;
                visit[j][i] = 2;
            }
        }
    }
    //力
    force = d3.layout.force()
        .nodes(nodes)
        .links(edges)
        .size([width, height])
        .linkDistance(function (d, i) {
            var s12 = getEDistance(d.source.index, d.target.index);
            return s12;
        })
        .linkStrength(1)
        .gravity(g_value)
        .charge(r_value);
    force.start();

    //边
    var svg_edges = svg.selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("opacity", opacity)
        .style("stroke-width", 1);


    //节点
    var svg_nodes = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 4)
        .attr("fill", "steelblue")
        .attr("opacity",0.5)
        //.attr("class", "normalClass")
        .attr("id", function (d, i) {
            return "forceCircle" + i;
        })
        .on("click",function(d,i){
            //点击后变红
            if(!vfreeSketch){
                return;
            }
            var classPoint = "xClickPoint";
            if(ScatterFlag % 2 == 0){
                classPoint = "yClickPoint";
            }
            var name = d3.select(this)[0][0].className.animVal;
            if(name == classPoint){
                d3.select(this)
                    .attr("class", "normalClass")
                    .style("r", 4 / nowScale);
                deltDetail(i);
            }
            else {
                d3.select(this)
                    .attr("class", classPoint)
                    .style("r", 6 / nowScale);
                memDetail(i);
            }
            plotDetail(i);//细节
        })
        .on("dblclick", function (d, i) {
            console.log(i);
        })
        .on("mousemove", function (d,i) {
            plotDetail(i);
            d3.select(this)
                .style("r", 6 / nowScale);
        })
        .on("mouseout", function (d, i) {
            d3.select(this)
                .style("r", 4 / nowScale);
        });

    force.on("tick", function () { //更新位置
        svg_edges
            .attr("x1", function (d) {
                if(layoutForce) {
                    for(var j = 0; j < fixPoint.length; j ++) {
                        if(fixPoint[j].length <= 0){
                            continue;
                        }
                        var flagforce = 0;
                        for (var i = 0; i < fixPoint[j].length; i++) {
                            if (d.source.index == fixPoint[j][i][0]) {
                                d.source.x = fixPoint[j][i][1];
                                flagforce = 1;
                                break;
                            }
                        }
                        if(flagforce){
                            break;
                        }
                    }
                }
                return d.source.x;
            })
            .attr("y1", function (d) {
                if(layoutForce) {
                    for(var j = 0; j < fixPoint.length; j ++) {
                        if (fixPoint[j].length <= 0) {
                            continue;
                        }
                        var flagforce = 0;
                        for (var i = 0; i < fixPoint[j].length; i++) {
                            if (d.source.index == fixPoint[j][i][0]) {
                                d.source.y = fixPoint[j][i][2];
                                flagforce = 1;
                                break;
                            }
                        }
                        if(flagforce){
                            break;
                        }
                    }
                }
                return d.source.y;
            })
            .attr("x2", function (d) {
                if(layoutForce) {
                    for(var j = 0; j < fixPoint.length; j ++) {
                        if (fixPoint[j].length <= 0) {
                            continue;
                        }
                        var flagforce = 0;
                        for (var i = 0; i < fixPoint[j].length; i++) {
                            if (d.target.index == fixPoint[j][i][0]) {
                                d.target.x = fixPoint[j][i][1];
                                flagforce = 1;
                                break;
                            }
                        }
                        if(flagforce){
                            break;
                        }
                    }
                }
                return d.target.x;
            })
            .attr("y2", function (d) {
                if(layoutForce) {
                    for(var j = 0; j < fixPoint.length; j ++) {
                        if (fixPoint[j].length <= 0) {
                            continue;
                        }
                        var flagforce = 0;
                        for (var i = 0; i < fixPoint[j].length; i++) {
                            if (d.target.index == fixPoint[j][i][0]) {
                                d.target.y = fixPoint[j][i][2];
                                flagforce = 1;
                                break;
                            }
                        }
                        if(flagforce){
                            break;
                        }
                    }
                }
                return d.target.y;
            });


        svg_nodes.attr("cx", function (d, i) {
                if(layoutForce) {
                    for(var z = 0; z < fixPoint.length; z ++) {
                        if (fixPoint[z].length <= 0) {
                            continue;
                        }
                        var flagforce = 0;
                        for (var j = 0; j < fixPoint[z].length; j++) {
                            if (i == fixPoint[z][j][0]) {
                                d.x = fixPoint[z][j][1];
                                flagforce = 1;
                                break;
                            }
                        }
                        if(flagforce){
                            break;
                        }
                    }
                }
                if(sizeForce.maxx < d.x){
                    sizeForce.maxx = d.x;
                }
                if(sizeForce.minx > d.x){
                    sizeForce.minx = d.x;
                }
                return d.x;
            })
            .attr("cy", function (d, i) {
                if(layoutForce) {
                    for(var z = 0; z < fixPoint.length; z ++) {
                        if (fixPoint[z].length <= 0) {
                            continue;
                        }
                        var flagforce = 0;
                        for (var j = 0; j < fixPoint[z].length; j++) {
                            if (i == fixPoint[z][j][0]) {
                                d.y = fixPoint[z][j][2];
                                flagforce = 1;
                                break;
                            }
                        }
                        if(flagforce){
                            break;
                        }
                    }
                }
                if(sizeForce.maxy < d.y){
                    sizeForce.maxy = d.y;
                }
                if(sizeForce.miny > d.y){
                    sizeForce.miny = d.y;
                }
                return d.y;
            });

        var sizeDisx = sizeForce.maxx - sizeForce.minx;
        var sizeDisy = sizeForce.maxy - sizeForce.miny;
        if(onlyOneForce && Math.max(sizeDisx, sizeDisy) > 600) {
            var zoomForce = 600 / Math.max(sizeDisx, sizeDisy);
            var moveForce = [300 - 300 * zoomForce, 300 - 300 * zoomForce];
            d3.select("#svg1").selectAll("*")
                .attr("transform", "translate(" + moveForce + ")" + "scale(" + zoomForce + ")");
            d3.selectAll("circle").attr("r", 4 / zoomForce);
            d3.selectAll("line").style("stroke-width", 2 / zoomForce);
            nowScale = zoomForce;
            nowTran = moveForce;
        }

        if(d3.select("#serchPoint" + serchPointId)[0][0] != null) {
            d3.select("#serchPoint" + serchPointId)
                .attr("cx", nodes[serchPointId].x)
                .attr("cy", nodes[serchPointId].y);
        }
        var updateid = document.getElementsByClassName("xChoosePoint");
        var updateidIndex = -1;
        if(updateid.length){
            updateidIndex = parseInt(updateid[0].getAttribute("id"));
            updatePosition(updateidIndex);
        }
        updateid = document.getElementsByClassName("yChoosePoint");
        if(updateid.length){
            updateidIndex = parseInt(updateid[0].getAttribute("id"));
            updatePosition(updateidIndex);
        }
    });

    var time = 2000;
    var timeid = setInterval("change()", time);
    setTimeout("clearInterval("+timeid+")", time * 0);
}
function change(){
    force.start();
    force.alpha(1);
}

function updatePosition(updateidIndex){
    //if(updateidIndex >= savePath.length){
    //    updateidIndex -= 1;
    //}
    for(var i = 0; i < savePath[updateidIndex].length; i ++){
        var temid = document.getElementById(updateidIndex + "dragPoint" + i);
        var dragpx = nodes[savePath[updateidIndex][i]].x;
        var dragpy = nodes[savePath[updateidIndex][i]].y;
        temid.setAttribute("cx", dragpx);
        temid.setAttribute("cy", dragpy);
        var j = i - 1;
        if(i == savePath[updateidIndex].length - 1){
            temid = document.getElementById(updateidIndex + "dragLine" + j);
            temid.setAttribute("x2", dragpx);
            temid.setAttribute("y2", dragpy);
            continue;
        }
        temid = document.getElementById(updateidIndex + "dragLine" + i);
        temid.setAttribute("x1", dragpx);
        temid.setAttribute("y1", dragpy);
        if(j >= 0){
            temid = document.getElementById(updateidIndex + "dragLine" + j);
            temid.setAttribute("x2", dragpx);
            temid.setAttribute("y2", dragpy);
        }

    }
    temid = document.getElementById(updateidIndex + "dragPoint0").getAttribute("class");
    var samedateClass2 = document.getElementsByClassName(temid);
    if(temid == "xChoosePoint"){
        var samedateClass = document.getElementsByClassName("yChoosePoint");
    }
    else if(temid == "yChoosePoint"){
        var samedateClass = document.getElementsByClassName("xChoosePoint");
    }
    else{
        return;
    }
    if(!samedateClass.length){
        return;
    }
    if(parseInt(samedateClass[0].getAttribute("id")) != updateidIndex){
        return;
    }
    for(var z = 0; z < samedateClass.length; z ++){
        var temcx = samedateClass2[z].getAttribute("cx");
        samedateClass[z].setAttribute("cx", temcx);
        temcx = samedateClass2[z].getAttribute("cy");
        samedateClass[z].setAttribute("cy", temcx);
    }
    temid = document.getElementById(updateidIndex + "dragLine0").getAttribute("class");
    samedateClass2 = document.getElementsByClassName(temid);
    if(temid == "xChooseLine"){
        samedateClass = document.getElementsByClassName("yChooseLine");
    }
    else if(temid == "yChooseLine"){
        samedateClass = document.getElementsByClassName("xChooseLine");
    }
    for(var z = 0; z < samedateClass.length; z ++){
        var temcx = samedateClass2[z].getAttribute("x1");
        samedateClass[z].setAttribute("x1", temcx);
        temcx = samedateClass2[z].getAttribute("y1");
        samedateClass[z].setAttribute("y1", temcx);
        temcx = samedateClass2[z].getAttribute("x2");
        samedateClass[z].setAttribute("x2", temcx);
        temcx = samedateClass2[z].getAttribute("y2");
        samedateClass[z].setAttribute("y2", temcx);
    }
}

// 获取数据 绘制系统
function loadData(dataName) {
    //var csvName = document.getElementById("selectData").value;
    var csv = d3.dsv(",", "text/csv;charset=gb2312");
    var csv2 = d3.dsv(",", "text/csv;charset=gb2312");
    //var originData = [];

    var label = dataName+"2.csv";
    csv2(label, function (error, data) {
        if (error) throw error;
        var vec = [];
        for (var i in data) {
            for (var j in data[i]) {
                vec.push(data[i][j]);
            }
            originLabel.push(vec);
            vec = [];
        }
        //console.log(originLabel);
    });

    csv(dataName+".csv", function (error, data) {
        if (error) throw error;
        var vec = [];
        for(var z in data[1]){
            columnName.push(z);
        }
        for (var i in data) {
            for (var j in data[i]) {
                vec.push(parseFloat(data[i][j]));
            }
            originData.push(vec);
            vec = [];
        }
        //归一化
        for(var i = 0; i < originData[0].length; i ++){
            var max = originData[0][i];
            var min = originData[0][i];
            for(var j = 0 ; j < originData.length; j ++){
                if(originData[j][i] > max){
                    max = originData[j][i];
                }
                if(originData[j][i] < min){
                    min = originData[j][i];
                }
            }
            if(max-min == 0){
                for(var j = 0 ; j < originData.length; j ++) {
                    originData[j][i] = 0;
                }
                continue;
            }
            var div = 1/(max-min);
            for(var j = 0 ; j < originData.length; j ++) {
                originData[j][i] = (originData[j][i] - min) * div;
            }
        }
        //console.log(originData);  //原始数据
        //获取维度、大小
        document.getElementById("DataSize").value = originData.length;
        document.getElementById("Dimension").value = originData[0].length;
        //获得knn矩阵
        [KNNMatrix,KNNDistMatrix] = caculateKNN(originData,k_near);
        drawForceDirected();//KNNMatrix,originData

        getEveryEDistance();//得到每个点之间的欧式距离矩阵
        ISOMAP();
    });
}





