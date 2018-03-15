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

v = []
first = []
next1 = []
path = []
distance = []
wp = []
we = []


# Create your views here.
def home(request):
	if request.method == 'POST':
		# write functions
		if request.is_ajax() and request.POST['id'] == 'requestGetLine':
			drawDataNum = request.POST.get("drawDataNum")
			drawDataColumnNum = request.POST.get("drawDataColumnNum")
			drawData = request.POST.get("drawData")
			drawData, drawDataNum, drawDataColumnNum = formExchange(drawData, drawDataNum, drawDataColumnNum)
			knnNum = request.POST.get("knnNum")
			knnColumnNum = request.POST.get("knnColumnNum")
			knn = request.POST.get("knn")
			knn, knnNum, knnColumnNum = formExchange(knn, knnNum, knnColumnNum)
			knnDisNum = request.POST.get("knnDisNum")
			knnDisColumnNum = request.POST.get("knnDisColumnNum")
			knnDis = request.POST.get("knnDis")
			knnDis, knnDisNum, knnDisColumnNum = formExchange(knnDis, knnDisNum, knnDisColumnNum)

			positionDataNum = request.POST.get("positionDataNum")
			positionDataColumnNum = request.POST.get("positionDataColumnNum")
			positionData = request.POST.get("positionData")
			positionData, positionDataNum, positionDataColumnNum = formExchange(positionData, positionDataNum, positionDataColumnNum)



			init(len(knn))
			Edge_input(knn, knnDis)
			result = Line_input(drawData, positionData)


			result = {
				'result' : result
			}

			return HttpResponse(json.dumps(result))
 
		return HttpResponse(json.dumps({'message': "error"}))
	return render_to_response('home.html',{'handler': []}, 		context_instance=RequestContext(request))


def formExchange(Data, DataNum, DataColumnNum):# 将数据进行格式转换
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
			vec.append(float(temData[i*DataColumnNum+j]))
		Data.append(vec)
		vec = []
	return Data, DataNum, DataColumnNum


class PriorityQueue:
	def __init__(self):
		self._queue = []

	def push(self, priority, item):
		heappush(self._queue, (priority, item))

	def pop(self):
		return heappop(self._queue)
	def top(self):
		return heapq.nlargest(1,self._queue)
	def empty(self):
		if len(self._queue) == 0:
			return True
		return False

def readCsvToFloat(name):
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

	print "readCsvToInt"
	return data
#计算两点之间的距离
def cal_dis(pointA, pointB):
	c = np.array(pointA)
	d = np.array(pointB)
	return numpy.linalg.norm(c - d)
#计算点到某一线段的距离
def disToline(point, lineA, lineB):
	flag = 1
	tempoint = []
	if(lineB[0] == lineA[0]):
		tempoint.append(lineA[0])
		tempoint.append(point[1])
		flag = 0
	if(lineA[1] == lineB[1]):
		tempoint.append(point[0])
		tempoint.append(lineA[1])
		flag = 0
	if flag:
		k = (lineB[1] - lineA[1]) / (lineB[0] - lineA[0])
		tempoint.append((k * k * lineA[0] + k * (point[1] - lineA[1]) + point[0]) / (k * k + 1))
		tempoint.append(k * (tempoint[0] - lineA[0]) + lineA[1])

	print "disToline"

	if min(lineA[0], lineB[0]) <= tempoint[0] and tempoint[0] <= max(lineA[0], lineB[0]):
		return cal_dis(tempoint, point)
	else:
		return min(cal_dis(point, lineA), cal_dis(point, lineB))


def cal_wp(point, originData):
	#对每一个数据点，计算他们与曲线的距离（取最近的那条线段）
	for i in range(len(originData) - 1):
		for j in range(len(point)):
			if point[j][0] <= originData[i + 1][0]:
				t = disToline(point[j], originData[i], originData[i + 1])
				if t < wp[j]:
					wp[j] = t
	# maxWp = max(wp)
	for i in range(len(wp)):
		wp[i] /= 1000

	print "cal_wp"


def init(num):
	for i in range(num):
		distance.append(-1.0)
		wp.append(100000000000.0)  #find max value
		path.append(-1)
		first.append(-1)


def add_edge(a, b, c, e):
	v.append(b)
	next1.append(first[a])
	we.append(c)
	first[a] = e

def Edge_input(KNNMatrix, KNNDistMatrix):
	e = 0
	for i in range(len(KNNMatrix)):
		for j in range(1, len(KNNDistMatrix[i])):
			add_edge(int(KNNMatrix[i][0]),int(KNNMatrix[i][j]),KNNDistMatrix[i][j],e)
			e += 1

def Line_input(point, originData):
	src = 0
	end = 0
	mmin1 = mmin2 = 100000000000.0  #find max value
	for i in range(len(originData)):
		dis1 = cal_dis(originData[i], point[0])
		dis2 = cal_dis(originData[i], point[len(point) - 1])
		if dis1 < mmin1:
			src = i
			mmin1 = dis1
		if dis2 < mmin2:
			end = i
			mmin2 = dis2
	#print(src,end)
	print "Line_input"
	cal_wp(point, originData)
	dijkstra(src)

	return path_print(end, src)



def dijkstra(src):
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
		while i != -1 :
			if distance[v[i]] == -1 or distance[v[i]] > distance[u[2]] + we[i] + wp[v[i]]:
				if(path[u[2]] != v[i]):
					path[v[i]] = u[2]
					distance[v[i]] = distance[u[2]] + we[i] + wp[v[i]]
					q.push(distance[v[i]],v[i])
			i = next1[i]

	print "dijkstra"

def path_print(end, src):
	t=0
	pathToreverse = []
	short_path = []
	i = end
	while i != -1 and i != src and path[i] != -1:
		pathToreverse.append(path[i])
		i = path[i]
		print i, src, end
	lenOfpath = len(pathToreverse)
	#print(lenOfpath)\
	print "donen"

	for i in range(lenOfpath):
		short_path.append(pathToreverse[lenOfpath-i-1])
	short_path.append(end)
	print "path_prit"
	return short_path    #here the result is