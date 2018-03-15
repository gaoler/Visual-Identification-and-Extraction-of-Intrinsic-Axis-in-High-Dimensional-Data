/**
 * Created by Administrator on 2016/11/15.
 */

//保留点的路径
function SavePath(){
    AxisIndex ++;
    var Axix = d3.select("#selectxAxis")
        .append("option")
        .attr("value",AxisIndex)
        .attr("id","xAxis")
        .text(newxAxisname + AxisIndex);
    var temAxix = d3.select("#selectyAxis")
        .append("option")
        .attr("value",AxisIndex)
        .attr("id","yAxis")
        .text(newyAxisname + AxisIndex);

    if(ScatterFlag % 2){
        Axix = temAxix;
    }
    Axix.attr("selected","true");
    savePath.push(dotPath);
    saveDis.push(dotDist);
    fixPoint.push([]);
}

//响应下拉框点击事件
function changeX(event){
    var x_id = document.getElementById("selectxAxis").selectedIndex;
    if(x_id == 0){
        showXorY(2);
        return;
    }
    plotX(x_id - 1);
}
function changeY(event){
    var y_id = document.getElementById("selectyAxis").selectedIndex;
    if(y_id == 0){
        showXorY(3);
        return;
    }
    plotY(y_id - 1);
}

function showXorY(type) {
    var obj = document.getElementById("selectyAxis");
    if(type % 2){
        obj = document.getElementById("selectxAxis");
    }
    var index = obj.selectedIndex;
    if(!index){
        alert("无法选择");
        Clear();
        return;
    }

    if(type % 2){
        scatterY = saveY[index - 1];
        d3.select("#yriver").select("*").remove();
        d3.selectAll(".yChooseLine").remove();
        d3.selectAll(".yChoosePoint").remove();
        ScatterFlag = 2;
    }
    else{
        scatterX = saveY[index - 1];
        d3.select("#xriver").select("*").remove();
        d3.selectAll(".xChooseLine").remove();
        d3.selectAll(".xChoosePoint").remove();
        ScatterFlag = 3;
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

function plotX(index){
    dotPath = savePath[index];
    dotDist = saveDis[index];
    ScatterFlag = 2;
    reView(index);
}
function plotY(index){
    dotPath = savePath[index];
    dotDist = saveDis[index];
    ScatterFlag = 3;
    reView(index);
}

//最后一次删除时，删除所有相关信息
function Clear(){
    d3.select("#dvPlot").select("*").remove();
    d3.select("#xriver").select("*").remove();
    d3.select("#yriver").select("*").remove();
    d3.selectAll(".xChooseLine").remove();
    d3.selectAll(".yChooseLine").remove();
    d3.selectAll(".xChoosePoint").remove();
    d3.selectAll(".yChoosePoint").remove();
    savePath = [];
    saveDis = [];
    saveChoose = [];
    saveY = [];
    scatterX = [];
    scatterY = [];
    ScatterFlag = -1;
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
    AxisIndex = 0;


    //删除固定点但不是xy轴的信息
    for(var i = 0; i < fixPoint.length; i ++){
        d3.selectAll(".beforeDragPoint" + i).remove();
        d3.selectAll(".beforeDragLine" + i).remove();
    }
    fixPoint = [];
    //删除固定点且是xy轴的信息
    d3.selectAll(".xDragChooseLine").remove();
    d3.selectAll(".yDragChooseLine").remove();
    d3.selectAll(".xDragChoosePoint").remove();
    d3.selectAll(".yDragChoosePoint").remove();
    //最后将高亮的点变成普通颜色
    d3.select("#svg1").selectAll("circle")
        .attr("class", "normalClass");
}
//删除
function deletPath(type){
    //force.stop();
    var obj = document.getElementById("selectxAxis");
    var obj2 = document.getElementById("selectyAxis");
    if(type % 2){
        obj = document.getElementById("selectyAxis");
        obj2 = document.getElementById("selectxAxis");
    }
    var index1=obj.selectedIndex;
    if(obj.length == 1 || index1 == 0){
        alert("已无删除的选项~");
        return;
    }
    var val_delete = obj.options[index1].value;
    var change = 0;
    if (val_delete == obj2.options[obj2.selectedIndex].value) {
        change = 1;
    }
    obj.options.remove(index1);
    if(obj.length > 1) {
        obj.selectedIndex = 1;
    }
    obj2.options.remove(index1);
    if(change) {
        obj2.selectedIndex = 1;
    }
    if(obj2.selectedIndex == 0){
        obj2.selectedIndex = 1;
        change = 1;
    }
    if(obj.selectedIndex == 0) {
        Clear();
        return;
    }
    deletView(index1 - 1, type, change);
}
//删除后的视图呈现
function deletView(deletIndex, type, change){
    if(change){
        deletLine(type + 1);
    }
    deletLine(type);
    deletDrag(deletIndex);
    dotPath = savePath[0];
    dotDist = saveDis[0];
    ScatterFlag = type;
    reView(0);
    if(change){
        ScatterFlag ++;
        reView(0);
    }
}
function deletLine(type){
    if(type % 2){
        d3.selectAll(".yDragChoosePoint").remove();
        d3.selectAll(".yDragChooseLine").remove();
        d3.selectAll(".yChoosePoint").remove();
        d3.selectAll(".yChooseLine").remove();
    }
    else{
        d3.selectAll(".xDragChoosePoint").remove();
        d3.selectAll(".xDragChooseLine").remove();
        d3.selectAll(".xChoosePoint").remove();
        d3.selectAll(".xChooseLine").remove();
    }
}
function deletDrag(deletIndex){
    d3.selectAll(".beforeDragPoint" + deletIndex).remove();
    d3.selectAll(".beforeDragLine" + deletIndex).remove();
    for(var i = deletIndex + 1; i < savePath.length; i ++){
        var z = i - 1;
        for(var j = 0; j < savePath[i].length; j ++){
            document.getElementById(i + "dragPoint" + j).setAttribute("id", z + "dragPoint" + j);
            if(j == savePath[i].length - 1){
                continue;
            }
            document.getElementById(i + "dragLine" + j).setAttribute("id", z + "dragLine" + j);
        }
        var exi = d3.selectAll(".beforeDragPoint" + i);
        if(exi.length){
            exi.attr("class", "beforeDragPoint" + z);
            d3.selectAll(".beforeDragLine" + i)
                .attr("class", "beforeDragLine" + z);
        }
    }
    savePath.splice(deletIndex, 1);
    saveDis.splice(deletIndex, 1);
    saveY.splice(deletIndex, 1);
    fixPoint.splice(deletIndex, 1);
    //force.start();
}

function reView(type){
    //ReadRiverData();
    River();
    Projection(type);
    dotIndex = [];
}

function changeR(){
    d3.select("#svg1").selectAll("circle").style("r", 4 / nowScale);
    d3.select("#svg1").selectAll(".xChoosePoint").style("r", 6 / nowScale);
    d3.select("#svg1").selectAll(".yChoosePoint").style("r", 6 / nowScale);
    d3.select("#svg1").selectAll(".xDragChoosePoint").style("r", 6 / nowScale);
    d3.select("#svg1").selectAll(".yDragChoosePoint").style("r", 6 / nowScale);
    d3.select("#svg1").selectAll("line").style("stroke-width", 2 / nowScale);
}

function dataZoom(){
    d3.select("body").on("keydown",function(){
        if(d3.event.keyCode == 68){
            if(dotIndex.length >= 2 && vfreeSketch){
                dotSelect();
            }
        }
        else if (d3.event.keyCode == 90) {
            initButton();
            var zoom = d3.behavior.zoom()
            .scaleExtent([0,500])
            .translate(nowTran)
            .scale(nowScale)
            .on("zoom",function(){
                d3.select(this).selectAll("*")
                    .attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
                nowScale = d3.event.scale;
                nowTran = d3.event.translate;
                changeR();
            });
            d3.select('#svg1').call(zoom);
        }
        else if (d3.event.keyCode == 88) {
            force.stop();
        }
        else if(d3.event.keyCode == 67) {
            Clear();
        }
        else if(d3.event.keyCode == 107){
            pictureMuch += 0.1;
            if(pictureMuch > 1){
                pictureMuch = 1;
            }
            randomPicture();
        }
        else if(d3.event.keyCode == 109){
            pictureMuch -= 0.1;
            if(pictureMuch < 0){
                pictureMuch = 0;
            }
            randomPicture();
        }
    }).on("keyup",function(){
        d3.select('#svg1').on(".zoom",null);
    });

}


function SearchLabel() {
    d3.select("#serchPoint" + serchPointId).remove();
    var searchname=document.getElementById("data_index").value;
    var index = -1;
    for(var i=0;i<originLabel.length;i++){
        if(originLabel[i]==searchname) {
            index=i;
            break;
        }
    }
    if(index == -1){
        document.getElementById('data_index').value = "None";
        document.getElementById('details').innerHTML = "";
        return;
    }
    plotDetail(index);//细节
    serchPointId = index;
    d3.select("#svg1")
        .append("circle")
        .attr("cx", nodes[index].x)
        .attr("cy", nodes[index].y)
        .attr("r", 6 / nowScale)
        .attr("fill", "yellow")
        .attr("id", "serchPoint" + serchPointId)
        .attr("transform", "translate(" + nowTran + ")" + "scale(" + nowScale + ")")
        .on("mousemove", function(){
            d3.select(this).remove();
        });
}








