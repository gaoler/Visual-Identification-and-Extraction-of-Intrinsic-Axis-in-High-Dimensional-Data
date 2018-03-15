/**
 * Created by Administrator on 2016/11/28.
 */
function initButton(){
    vfreeSketch = 0;
    vanalysis = 0;
    layoutForce = 1;
    vmoveScreen = 0;
    vdeleteLine = 0;

    vlayout = 0;
    vdetatch = 0;

    document.getElementById("analyId").style.opacity=buttonOpricy1;
    document.getElementById("moveScreenId").style.opacity=buttonOpricy1;
    document.getElementById("deletId").style.opacity=buttonOpricy1;
    if(force!=undefined){
        force.stop();
    }
    onlyOneForce = 0;

    d3.select('#svg1').on(".drag", null);
    d3.selectAll("#alterPath").remove();

    var svg1 = d3.select("#svg1");
    var svg2 = d3.select("#scatterSvg");
    svg1.selectAll(".yellowClass")
        .attr("class","normalClass");
    svg2.selectAll(".yellowClass")
        .attr("class","normalClass");
    d3.select('#svg1').on(".zoom",null);
}

function ffreeSketch(){
    vfreeSketch = 1;
    alterDrawLine();
}

function fdrawChoosePoint(){
    if(dotIndex.length >= 2){
        document.getElementById("drawChoosePointId").style.opacity=buttonOpricy1;
        dotSelect();
    }
}

function fanaly(){
    var id = document.getElementById("analyId").style.opacity;
    if(id == buttonOpricy1){
        initButton();
        vanalysis = 1;
        document.getElementById("analyId").style.opacity = buttonOpricy2;
        drawLineChoosePoint();
    }
    else{
        initButton();
        ffreeSketch();
    }

}
function fdelet(){
    var id = document.getElementById("deletId").style.opacity;
    if(id == buttonOpricy1){
        initButton();
        vdeleteLine = 1;
        document.getElementById("deletId").style.opacity=buttonOpricy2;
    }
    else{
        initButton();
        ffreeSketch();
    }

}

function fmoveScreen(){
    var id = document.getElementById("moveScreenId").style.opacity;
    if(id == buttonOpricy1){
        initButton();
        vmoveScreen = 1;
        document.getElementById("moveScreenId").style.opacity=buttonOpricy2;
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
    else{
        initButton();
        ffreeSketch();
    }

}
function zoomUp(){
    force.stop();
    d3.select('#svg1').on(".zoom",null);
    initButton();
    ffreeSketch();
    nowScale += 0.1;
    d3.select("#svg1").selectAll("*")
        .attr("transform", "translate(" + nowTran + ")" + "scale(" + nowScale + ")");
    changeR();
}
function zoomDown(){
    force.stop();
    d3.select('#svg1').on(".zoom",null);
    initButton();
    ffreeSketch();
    if(nowScale - 0.1 > 0){
        nowScale -= 0.1;
    }
    d3.select("#svg1").selectAll("*")
        .attr("transform", "translate(" + nowTran + ")" + "scale(" + nowScale + ")");
    changeR();
}


