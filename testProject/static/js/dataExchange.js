/**
 * Created by Administrator on 2016/11/15.
 */
function getLine(coords) {
    var positionData = [];
    for(var i = 0; i < nodes.length; i ++){
        vec = [];
        vec.push(nodes[i].x  * nowScale + nowTran[0]);
        vec.push(nodes[i].y * nowScale + nowTran[1]);
        positionData.push(vec);
    }

    var vec = [];
    WeightMatrix = [];
    for(var i=0;i<realWeight.length;i++) {
        for (var j = 0; j < realWeight.length; j++) {
            if(realWeight[i][j] < Infinity) {
                vec.push(realWeight[i][j]);
            }
            else{
                vec.push(-1);
            }
        }
        WeightMatrix.push(vec);
        vec = [];
    }
    //for(var i = 0; i < zoneDistance.length; i ++){
    //    WeightMatrix[zoneDistance[i][1]][zoneDistance[i][2]] = zoneDistance[i][0];
    //    WeightMatrix[zoneDistance[i][2]][zoneDistance[i][1]] = zoneDistance[i][0];
    //}

    var formData = new FormData();
    formData.append("id","requestGetLine");
    formData.append("csrfmiddlewaretoken", token);

    formData.append("drawData",coords);
    formData.append("drawDataNum",coords.length);
    formData.append("drawDataColumnNum",coords[0].length);
    formData.append("knnDis",WeightMatrix);
    formData.append("knnDisNum",WeightMatrix.length);
    formData.append("knnDisColumnNum",WeightMatrix[0].length);
    formData.append("connectZone",connectZone);
    //formData.append("zoneDistance",zoneDistance);
    //formData.append("zoneDistanceNum",zoneDistance.length);
    //formData.append("zoneDistanceColumnNum",zoneDistance[0].length);
    formData.append("positionData",positionData);
    formData.append("positionDataNum",positionData.length);
    formData.append("positionDataColumnNum",positionData[0].length);
    formData.append("originData",originData);
    formData.append("originDataNum",originData.length);
    formData.append("originDataColumnNum",originData[0].length);


    $.ajaxSetup({
        data: {csrfmiddlewaretoken: '{{ csrf_token }}' },
    });

    $.ajax(
            {
                url:"/",
                type:"POST",
                data:formData,
                processData: false,
                contentType: false,
                success:function(data){
                    jsonData = $.parseJSON(data);
                    var result = jsonData.result;
                    //console.log("scuess");
                    dotPath = result;
                    dotDist = [];
                    for(var i = 0; i < dotPath.length - 1; i ++){
                        var sum = 0;
                        for (var j = 0; j < originData[0].length; j ++) {
                            sum += Math.pow(originData[dotPath[i]][j] - originData[dotPath[i + 1]][j], 2);
                        }
                        dotDist.push(Math.sqrt(sum));  //计算得到点i和j之间的距离
                    }
                    ScatterFlag ++;
                    SavePath();
                    reView(-1);
                },
                error:function(data){
                }
            });


}

function getConnectZone(){
    var temWeightMatrix = [];
    vec = [];
    for(var i = 0; i < WeightMatrix.length; i ++){
        for(var j = 0; j < WeightMatrix[0].length; j ++){
            if(realWeight[i][j] < Infinity) {
                vec.push(realWeight[i][j]);
            }
            else{
                vec.push(-2);
            }
        }
        temWeightMatrix.push(vec);
        vec = [];
    }
    var formData = new FormData();
    formData.append("id","requestConnect");
    formData.append("csrfmiddlewaretoken", token);

    formData.append("weightData",temWeightMatrix);
    formData.append("weightDataNum",temWeightMatrix.length);
    formData.append("weightDataColumnNum",temWeightMatrix[0].length);
    formData.append("originData",originData);
    formData.append("originDataNum",originData.length);
    formData.append("originDataColumnNum",originData[0].length);

    $.ajaxSetup({
        data: {csrfmiddlewaretoken: '{{ csrf_token }}' },
    });

    var result;
    $.ajax(
            {
                url:"/",
                type:"POST",
                data:formData,
                processData: false,
                contentType: false,
                success:function(data){
                    document.getElementById("hide").style.display="none";
                    jsonData = $.parseJSON(data);
                    result = jsonData.result;
                    connectZone = result[0];
                    zoneDistance = result[1];
                },
                error:function(data){
                }
            });
}


function Projection(type){
    var temWeightMatrix = [];
    vec = [];
    for(var i = 0; i < realWeight.length; i ++){
        for(var j = 0; j < realWeight[0].length; j ++){
            if(realWeight[i][j] < Infinity) {
                vec.push(realWeight[i][j]);
            }
            else{
                vec.push(-1);
            }
        }
        temWeightMatrix.push(vec);
        vec = [];
    }
    var domain=[];
    var tem=0;
    domain.push(0);
    for(var i=0;i<dotDist.length;i++){
        tem=tem+dotDist[i];
        domain.push(tem);
    }

    var formData = new FormData();
    formData.append("id","requestGetProjection");
    formData.append("csrfmiddlewaretoken", token);

    formData.append("dotPath",dotPath);
    formData.append("domain",domain);
    formData.append("weightData",temWeightMatrix);
    formData.append("weightDataNum",temWeightMatrix.length);
    formData.append("weightDataColumnNum",temWeightMatrix[0].length);

    formData.append("originData",originData);
    formData.append("originDataNum",originData.length);
    formData.append("originDataColumnNum",originData[0].length);
    formData.append("ScatterFlag",ScatterFlag);
    formData.append("saveorNo",type);


    $.ajaxSetup({
        data: {csrfmiddlewaretoken: '{{ csrf_token }}' },
    });

    var result;
    $.ajax(
            {
                url:"/",
                type:"POST",
                data:formData,
                processData: false,
                contentType: false,
                success:function(data){
                    jsonData = $.parseJSON(data);
                    result = jsonData.result;
                    if(result[5] == -1) {
                        saveY.push(result[1]);
                    }
                    ReadScatterData(result[0], result[1], result[3]);
                    edges_link(result[2], result[3], result[4], result[5]);
                },
                error:function(data){
                }
            });
}

function ISOMAP(){
    var formData = new FormData();
    formData.append("id","requestISOMAP");
    formData.append("csrfmiddlewaretoken", token);

    formData.append("k_value",k_near);
    formData.append("originDataNum",originData.length);
    formData.append("originDataColumnNum",originData[0].length);
    formData.append("originData",originData);


    $.ajaxSetup({
        data: {csrfmiddlewaretoken: '{{ csrf_token }}' },
    });

    var result;
    $.ajax(
            {
                url:"/",
                type:"POST",
                data:formData,
                processData: false,
                contentType: false,
                success:function(data){
                    jsonData = $.parseJSON(data);
                    result = jsonData.result;
                    drawISOMAP(result[0], "isomap");
                    drawISOMAP(result[1], "tsne");
                },
                error:function(data){
                }
            });
}


