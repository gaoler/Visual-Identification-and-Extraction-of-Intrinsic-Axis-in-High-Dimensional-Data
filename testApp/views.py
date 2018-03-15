#!/usr/bin/python
# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.shortcuts import render_to_response, RequestContext
from django.http import HttpResponse
import json
import heapq
from heapq import heappush, heappop
import numpy
import numpy as np
from sklearn import manifold
import math
import copy

v = []
first = []
next1 = []
path = []
distance = []
wp = []
we = []
# 得到连通图
visited = []
resultConnect = []
weightConnect = []


# Create your views here.
def home(request):
	if request.method == 'POST':
		# write functions
		if request.is_ajax() and request.POST['id'] == 'requestGetLine':
			drawDataNum = request.POST.get("drawDataNum")
			drawDataColumnNum = request.POST.get("drawDataColumnNum")
			drawData = request.POST.get("drawData")
			drawData, drawDataNum, drawDataColumnNum = formExchange(drawData, drawDataNum, drawDataColumnNum, 1)

			knnDisNum = request.POST.get("knnDisNum")
			knnDisColumnNum = request.POST.get("knnDisColumnNum")
			knnDis = request.POST.get("knnDis")
			knnDis, knnDisNum, knnDisColumnNum = formExchange(knnDis, knnDisNum, knnDisColumnNum, 1)

			connectZone = request.POST.get("connectZone")
			connectZone = formExchangeOne(connectZone, 0)
			# zoneDistanceNum = request.POST.get("zoneDistanceNum")
			# zoneDistanceColumnNum = request.POST.get("zoneDistanceColumnNum")
			# zoneDistance = request.POST.get("zoneDistance")
			# zoneDistance, zoneDistanceNum, zoneDistanceColumnNum = formExchange(zoneDistance, zoneDistanceNum, zoneDistanceColumnNum, 1)


			positionDataNum = request.POST.get("positionDataNum")
			positionDataColumnNum = request.POST.get("positionDataColumnNum")
			positionData = request.POST.get("positionData")
			positionData, positionDataNum, positionDataColumnNum = formExchange(positionData, positionDataNum, positionDataColumnNum, 1)

			originDataNum = request.POST.get("originDataNum")
			originDataColumnNum = request.POST.get("originDataColumnNum")
			originData = request.POST.get("originData")
			originData, originDataNum, originDataColumnNum = formExchange(originData, originDataNum, originDataColumnNum, 1)


			dotIndex = find_comp(drawData, positionData)
			connectMax = max(connectZone)
			for i in range(len(dotIndex) - 1):
				if(connectZone[dotIndex[i]] != connectZone[dotIndex[i + 1]]):
					# minIndex = min(connectZone[dotIndex[i]], connectZone[dotIndex[i + 1]])# 连接不连通区域的最近的点
					# maxIndex = max(connectZone[dotIndex[i]], connectZone[dotIndex[i + 1]])
					# distanceIndex = 0
					# for j in range(minIndex):
					# 	distanceIndex += connectMax - j
					# distanceIndex += maxIndex - minIndex - 1
					# knnDis[int(zoneDistance[distanceIndex][1])][int(zoneDistance[distanceIndex][2])] = zoneDistance[distanceIndex][0]
					# knnDis[int(zoneDistance[distanceIndex][2])][int(zoneDistance[distanceIndex][1])] = zoneDistance[distanceIndex][0]
					s = getEDistance(originData[dotIndex[i]], originData[dotIndex[i + 1]])
					knnDis[dotIndex[i]][dotIndex[i + 1]] = s
					knnDis[dotIndex[i + 1]][dotIndex[i]] = s

			initlast()
			init(len(knnDis))
			Edge_input(knnDis)
			result = Line_input(drawData, positionData)

			result = {
				'result' : result
			}

			return HttpResponse(json.dumps(result))

		if request.is_ajax() and request.POST['id'] == 'requestGetProjection':
			ScatterFlag = request.POST.get("ScatterFlag")
			ScatterFlag = ScatterFlag.encode("utf-8")
			ScatterFlag = int(ScatterFlag)

			type = request.POST.get("saveorNo")
			type = type.encode("utf-8")
			type = int(type)

			dotPath = request.POST.get("dotPath")
			dotPath = formExchangeOne(dotPath, 0)
			domain = request.POST.get("domain")
			domain = formExchangeOne(domain, 1)

			originDataNum = request.POST.get("originDataNum")
			originDataColumnNum = request.POST.get("originDataColumnNum")
			originData = request.POST.get("originData")
			originData, originDataNum, originDataColumnNum = formExchange(originData, originDataNum, originDataColumnNum, 1)

			weightDataNum = request.POST.get("weightDataNum")
			weightDataColumnNum = request.POST.get("weightDataColumnNum")
			weightData = request.POST.get("weightData")
			weightData, weightDataNum, weightDataColumnNum = formExchange(weightData, weightDataNum, weightDataColumnNum, 1)


			for i in range(len(domain)):
				domain[i] = domain[i] / domain[len(domain) - 1]

			connectGraph = []
			vec = []
			for i in range(len(weightData)):
				for j in range(len(weightData[0])):
					if(weightData[i][j] > -0.5):
						vec.append(j)
				connectGraph.append(vec)
				vec = []

			flag = [0] * len(originData)
			projectX = [-1] * len(originData)
			projectY = [-1] * len(originData)
			SegementNum = [-1] * len(originData)
			temdotPath = []
			for i in range(len(dotPath)):
				flag[dotPath[i]] = 1
				projectX[dotPath[i]] = domain[i]
				projectY[dotPath[i]] = 0
				SegementNum[dotPath[i]] = i - 1
				temdotPath.append(dotPath[i])
			SegementNum[dotPath[0]] = 0
			havePath = []
			dotPath2 = []

			for znum in range(len(originData)):
				for i in range(len(originData)):
					if flag[i]:
						continue
					for j in range(len(dotPath)):
						if dotPath[j] in connectGraph[i]:
							havePath.append(dotPath[j])
					if(len(havePath) <= 0):
						continue
					flag[i] = 1
					dotPath2.append(i)
					v = 0
					div = 0
					zero = 0
					for z in range(len(havePath)):
						if(weightData[i][havePath[z]] == 0):
							projectX[i] = projectX[havePath[z]]
							projectY[i] = projectY[havePath[z]]
							SegementNum[i] = SegementNum[havePath[z]]
							zero = 1
							break
						v += projectX[havePath[z]] / weightData[i][havePath[z]]
						div += 1 / weightData[i][havePath[z]]
					if(zero):
						continue
					v /= div
					for z in range(1, len(domain)):
						if(v <= domain[z]):
							SegementNum[i] = z - 1
							break
					projectX[i] = v
					projectY[i] = VectorDistance(originData[temdotPath[z - 1]], originData[temdotPath[z]], originData[i])
					havePath = []
				dotPath = copy.deepcopy(dotPath2)
				dotPath2 = []


			result = {
				'result' : [projectX, projectY, SegementNum, ScatterFlag, temdotPath, type]
			}

			return HttpResponse(json.dumps(result))

		if request.is_ajax() and request.POST['id'] == 'requestISOMAP':
			k_value = request.POST.get("k_value")
			k_value = k_value.encode("utf-8")
			k_value = int(k_value)

			originDataNum = request.POST.get("originDataNum")
			originDataColumnNum = request.POST.get("originDataColumnNum")
			originData = request.POST.get("originData")
			originData, originDataNum, originDataColumnNum = formExchange(originData, originDataNum, originDataColumnNum, 1)

			data = getIsomap(originData, k_value)
			isomap = []
			for i in range(len(data)):
				isomap.append([data[i][0], data[i][1]])
			data = gettSNE(originData)
			tsne = []
			for i in range(len(data)):
				tsne.append([data[i][0], data[i][1]])

			result = {
				'result' : [isomap, tsne]
			}

			return HttpResponse(json.dumps(result))

		if request.is_ajax() and request.POST['id'] == 'requestConnect':
			weightDataNum = request.POST.get("weightDataNum")
			weightDataColumnNum = request.POST.get("weightDataColumnNum")
			weightData = request.POST.get("weightData")
			weightData, weightDataNum, weightDataColumnNum = formExchange(weightData, weightDataNum, weightDataColumnNum, 1)

			originDataNum = request.POST.get("originDataNum")
			originDataColumnNum = request.POST.get("originDataColumnNum")
			originData = request.POST.get("originData")
			originData, originDataNum, originDataColumnNum = formExchange(originData, originDataNum, originDataColumnNum, 1)

			initConnect(weightData)
			global resultConnect, weightConnect, visited

			count = 0
			for i in range(len(weightConnect)):
				if visited[i] == 0:
					dfs(i, count)
					count += 1


			differentDistance = getDifferentDistance(originData)

			result = {
				'result' : [resultConnect, differentDistance]
			}

			return HttpResponse(json.dumps(result))
 
		return HttpResponse(json.dumps({'message': "error"}))
	return render_to_response('home.html',{'handler': []}, 		context_instance=RequestContext(request))


def formExchange(Data, DataNum, DataColumnNum, flag):# 将数据进行格式转换
	DataNum = DataNum.encode("utf-8")
	DataColumnNum = DataColumnNum.encode("utf-8")
	DataNum = int(DataNum)
	DataColumnNum = int(DataColumnNum)
	Data = Data.encode("utf-8")
	temData = Data.split(',')
	Data = []
	vec = []
	for i in range(DataNum):
		for j in range(DataColumnNum):
			if flag:
				vec.append(float(temData[i*DataColumnNum+j]))
			else:
				vec.append(int(temData[i*DataColumnNum+j]))
		Data.append(vec)
		vec = []
	return Data, DataNum, DataColumnNum
def formExchangeOne(Data, flag):
	Data = Data.encode("utf-8")
	temData = Data.split(',')
	Data = []
	for i in range(len(temData)):
		if flag:
			Data.append(float(temData[i]))
		else:
			Data.append(int(temData[i]))
	return Data


class PriorityQueue:
	def __init__(self):
		self._queue = []

	def push(self, priority, item):
		heappush(self._queue, (priority, item))

	def pop(self):
		return heappop(self._queue)
	def top(self):
		return heapq.nsmallest(1,self._queue)
	def empty(self):
		if len(self._queue) == 0:
			return True
		return False
class PriorityQueue1:
	def __init__(self):
		self._queue = []

	def push(self, priority, item1, item2):
		heappush(self._queue, (priority, item1, item2))

	def pop(self):
		return heappop(self._queue)
	def top(self):
		return heapq.nsmallest(1,self._queue)
	def empty(self):
		if len(self._queue) == 0:
			return True
		return False

def readCsvToFloat(name):
	global v, first, next1, path, distance, wp, we
	import csv
	vec = []
	data = []
	with open(name,'r',encoding='utf-8') as f:
		reader = csv.reader(f)
		for row in reader:
			for i in row:
				vec.append(float(i))
			data.append(vec)
			vec = []
	return data
def readCsvToInt(name):
	global v, first, next1, path, distance, wp, we
	import csv
	vec = []
	data = []
	with open(name,'r',encoding='utf-8') as f:
		reader = csv.reader(f)
		for row in reader:
			for i in row:
				vec.append(int(i))
			data.append(vec)
			vec = []
	return data
#计算两点之间的距离
def cal_dis(pointA, pointB):
	global v, first, next1, path, distance, wp, we
	c = np.array(pointA)
	d = np.array(pointB)
	#print c,d,"c,d"
	# print numpy.linalg.norm(c - d)
	return numpy.linalg.norm(c - d)
#计算点到某一线段的距离
def disToline( lineA, lineB, point):
	global v, first, next1, path, distance, wp, we
	flag = 1
	tempoint = []
	if(lineB[0] == lineA[0]):
		tempoint.append(lineA[0])
		tempoint.append(point[1])
		flag = 0
	if(lineA[1] == lineB[1]):
		if len(tempoint) == 0:
			tempoint.append(point[0])
			tempoint.append(lineA[1])
		else:
			tempoint[0] = point[0]
			tempoint[1] = lineA[1]
		flag = 0
	if flag:
		k = (lineB[1] - lineA[1]) / (lineB[0] - lineA[0])
		tempoint.append((k * k * lineA[0] + k * (point[1] - lineA[1]) + point[0]) / (k * k + 1))
		tempoint.append(k * (tempoint[0] - lineA[0]) + lineA[1])

	if min(lineA[0], lineB[0]) <= tempoint[0] and tempoint[0] <= max(lineA[0], lineB[0]):
		return cal_dis(tempoint, point)
	else:
		return min(cal_dis(point, lineA), cal_dis(point, lineB))


def cal_wp(point, originData):
	#对每一个数据点，计算他们与曲线的距离（取最近的那条线段）
	#print len(point),len(originData)
	global v, first, next1, path, distance, wp, we
	for i in range(len(originData)):
		l = len(point)
		for j in range(len(point) - 1):
			# if point[j][0] <= originData[i + 1][0]:
			#print originData[i],point[j],point[j+1],j
			t = disToline(point[j], point[j + 1], originData[i])
			if t < wp[i]:
				wp[i] = t
			# maxWp = max(wp)-
	for i in range(len(wp)):
		wp[i] /= 1000
		#print wp[i]

def find_comp(line, point):  #传入曲线数组
	global v, first, next1, path, distance, wp, we
	replace = []
	for i in range(len(line)):
		mindis = 10000000
		minpot = 0
		for j in range(len(point)):
			tmp = cal_dis(line[i],point[j])#计算每个点j到曲线上的i点的距离
			if tmp<mindis:
				mindis = tmp
				minpot = j
		replace.append(minpot)
	return replace

def initlast():
	global v, first, next1, path, distance, wp, we
	v = []
	first = []
	next1 = []
	path = []
	distance = []
	wp = []
	we = []

def init(num):
	global v, first, next1, path, distance, wp, we
	if len(wp) == 0:
		for i in range(num):
			distance.append(-1.0)
			wp.append(100000000000.0)  # find max value
			path.append(-1)
			first.append(-1)
	else:
		for i in range(len(wp)):
			distance[i] = -1.0
			wp[i] = 100000000000.0
			path[i] = -1
			first[i] = -1

def add_edge(a, b, c, e):
	global v, first, next1, path, distance, wp, we
	v.append(b)
	next1.append(first[a])
	we.append(c)
	first[a] = e

def Edge_input(DistMatrix):
	global v, first, next1, path, distance, wp, we
	e = 0
	for i in range(len(DistMatrix)):
		for j in range(len(DistMatrix[i])):
			if(DistMatrix[i][j] > -0.5):
				add_edge(i,j,DistMatrix[i][j],e)
				e += 1

def Line_input(point, originData):
	global v, first, next1, path, distance, wp, we
	#path_set = []
	dis1 = PriorityQueue()
	dis2 = PriorityQueue()
	for i in range(len(originData)):
		dis1.push(cal_dis(originData[i], point[0]), i)
		dis2.push(cal_dis(originData[i], point[len(point) - 1]), i)
	tmp1 = dis1.top()
	dis1.pop()
	tmp1.extend(tmp1[0])
	src = tmp1[2]
	tmp2 = dis2.top()
	dis2.pop()
	tmp2.extend(tmp2[0])
	end = tmp2[2]
	#print point,originData
	cal_wp(point,originData)
	test = PriorityQueue1()
	for k in range(len(distance)):
		distance[k] = -1
		path[k] = -1
		#print i
	dijkstra(src)
		# for r in range(10):
		# 	path_set.append(path_print(end[r]))
		# 	if distance[end] != -1:
		# 		test.push(distance[end[r]], r, i)
	result = path_print(end)
		# print i, distance[end[0]], distance[end[1]], distance[end[2]], distance[end[3]], distance[end[4]], distance[end[5]], \
		# 	distance[end[6]], distance[end[7]], distance[end[8]], distance[end[9]]
	#while test.empty() == False:
		# t = test.top()
		# test.pop()
		# t.extend(t[0])
		# e = t[2]
		# s = t[3]
		#print s,e
		#result = path_set[s*10+e]
		#print result,distance[end[e]]
	if len(result) > 1 and result[0] != -1:
		return result
	fresult = []
	fresult.append(src)
	fresult.append(end)
	return fresult

def dijkstra(src):
	#print src,src,src,src
	global v, first, next1, path, distance, wp, we
	q = PriorityQueue()
	distance[src] = 0.0
	q.push(0,src)
	while q.empty() == False:
		tmp = q.top()
		tmp.extend(tmp[0])
		while q.empty() == False and tmp[1] > distance[tmp[2]]:
			q.pop()
			if q.empty() == True:
				break
			tmp = q.top()
			tmp.extend(tmp[0])
		if q.empty() == True :
			break
		u = q.top()
		u.extend(u[0])
		q.pop()
		i = first[u[2]]
		#print v[i]
		while i != -1 :
			if distance[v[i]] == -1 or distance[v[i]] > distance[u[2]] + wp[v[i]]:
				if(path[u[2]] != v[i]):
					path[v[i]] = u[2]
					distance[v[i]] = distance[u[2]] + wp[v[i]]
					#print distance[v[i]],wp[v[i]]
					q.push(distance[v[i]],v[i])
			i = next1[i]


def path_print(end):
	global v, first, next1, path, distance, wp, we
	flag = len(distance) * [0]
	t = 0
	pathToreverse = []
	short_path = []
	i = end
	while path[i] != -1:
		flag[i] += 1
		if (flag[i] > 3):
			break
		pathToreverse.append(path[i])
		i = path[i]
	lenOfpath = len(pathToreverse)
	# print(lenOfpath)
	for i in range(lenOfpath):
		short_path.append(pathToreverse[lenOfpath - i - 1])
	short_path.append(end)
	#print short_path
	return short_path   #here the result is


#######得到投影的信息函数
def VectorDistance(pointa, pointb, pointc):
	a = []
	b = []
	for i in range(len(pointa)):
		a.append(pointb[i] - pointa[i])
		b.append(pointb[i] - pointc[i])
	a = np.array(a)
	b = np.array(b)

	temLa = a.dot(a)
	temLb = b.dot(b)
	if temLa < 0:
		temLa = 0
	if temLb < 0:
		temLb = 0
	La = np.sqrt(temLa)
	Lb = np.sqrt(temLb)
	if Lb==0 or La == 0:
		cos_angle=1
	else:
		cos_angle = a.dot(b) / (La * Lb)
	cos1 = 1.0 - cos_angle * cos_angle
	if(cos1 < 0):
		cos1 = 0
	sin_angle = math.sqrt(cos1)
	# distancex = Lb * cos_angle
	distancey = Lb * sin_angle
	return distancey

# isomap算法
def getIsomap(MeanMatrix,knear):
	Y = manifold.Isomap(n_neighbors = knear,n_components = 2).fit_transform(MeanMatrix);
	return Y
def gettSNE(Matrix):
	tsne = manifold.TSNE(n_components=2, init='pca', random_state=0).fit_transform(Matrix)
	return tsne

# 得到不连通区域，以及两两之间的最短距离
def dfs(v, cot):
	global resultConnect, weightConnect, visited

	if visited[v]:
		return
	visited[v] = 1
	resultConnect[v] = cot
	for i in range(len(weightConnect)):
		if visited[i] == 0 and weightConnect[v][i] > -1:
			dfs(i, cot)
	return
def initConnect(weightData):
	global resultConnect, weightConnect, visited
	resultConnect = []
	weightConnect = []
	visited = []
	vec = []
	for i in range(len(weightData)):
		for j in range(len(weightData)):
			vec.append(weightData[i][j])
		weightConnect.append(vec)
		vec = []
	for i in range(len(weightData)):
		visited.append(0)
		resultConnect.append(-1)

def getDifferentDistance(originData):
	global resultConnect, weightConnect, visited
	zone = copy.deepcopy(resultConnect)
	maxzone = max(zone) + 1
	result = []
	for i in range(maxzone):
		for k in range(i + 1, maxzone):
			min = len(originData[0])
			vec = []
			for j in range(len(zone)):
				if zone[j] == i:
					for z in range(len(zone)):
						if zone[z] == k:
							s = getEDistance(originData[j], originData[z])
							if(s < min):
								min = s
								vec = [min, j, z]
			result.append(vec)
	return result

def getEDistance(pointA, pointB):
	s = 0
	for i in range(len(pointA)):
		s += math.pow(pointA[i] - pointB[i], 2)
	return np.sqrt(s)


