/**
 * Created by Administrator on 2016/11/15.
 */
//存放全局变量
//声明全局变量
var originData = [];   //原始数据

var k_near = 0;
var g_value = 0;
var opacity = 0;
var r_value = 0;
var force; //力引导图变量
//点的坐标
var nodes = [];
var edges = [];

//生成非线性轴并投影

var xRangeWidth=600;//非线性轴的长度

//knn矩阵
var KNNDistMatrix = [];
var KNNMatrix = [];
var WeightMatrix = new Array();
var realWeight = [];

//存储2点之间的路径
var dotIndex = [];
var dotPath = [];
var dotDist = [];
//保存功能所需的变量
var savePath = [];
var saveDis = [];
var saveChoose = [];
var saveY = [];
//散点图的横纵坐标
var scatterX = [];
var scatterY = [];
//画x轴还是y轴
var ScatterFlag = -1;

//保存到下拉框的显示名称
var newxAxisname="Axis - ";
var newyAxisname="Axis - ";
var AxisIndex = 0;

//获取当前画布的缩放比例
var nowScale = 1;
var nowTran = [0, 0];

//测试
var whichReduce = 0;//判断显示测地距离还是欧式距离
var everyEdistance = [];
var gdDistance = [];

//没有投影的点
var leftPoint = [];

//连通域
var connectZone = [];//所在的连通域
var zoneDistance = [];//不连通区域最近的距离

//固定的点的位置
var fixPoint = [];
//固定点重合的点
var fixOverPoint = [];
var visitOver = [];

//模式按钮
var vfreeSketch = 0;
var vanalysis = 0;
var layoutForce = 1;
var vmoveScreen = 0;
var vdeleteLine = 0;
//暂时不用
var vlayout = 0;
var vdetatch = 0;
//按钮透明度
var buttonOpricy1 = 0.4;
var buttonOpricy2 = 1;

//列名
var columnName = [];

var sizeForce = {minx:Infinity, maxx:-Infinity, miny:Infinity, maxy:-Infinity};
var onlyOneForce = 1;
var originLabel =[];    //数据标签


var serchPointId = -1;

var tooltip;//显示维度信息

var picture = 0;//是否显示图像
var pictureUrl;//图片的URL
var pictureMuch = 0;//控制图片出现的多少，0-1

var colorRiver;