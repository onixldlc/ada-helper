var input = `
#.#####
#*...*#
#..####
##.#..#
#.....#
#*.#.*#
#######
`

var originalTestCase = `
..#*
..*.
`

function parseInput(input){
	return input.split("\n").filter(value => value).map(value => value.split(""))
}

var test = parseInput(input);

var output = [
	[0,0,0,0]
];
var start = [1,2];
start[0] += start[1];
start[1] = start[0]-start[1]-1;
start[0] -= start[1]+2;

var tresuresList = [];


function createConnection(src, dst){
	return{
		"src":{
			"name": `[${src.x}, ${src.y}]`,
			"x": src.x,
			"y": src.y
		},
		"dst":{
			"name": `[${dst.x}, ${dst.y}]`,
			"x": dst.x,
			"y": dst.y
		}
	};
}

function generatePos(x,y){
	return {"x":x, "y":y}
}

function generateAllConnection(test, start){
	connectionList = [];
	for ( const [y, arr] of test.entries() ){
		for( const [x, char] of arr.entries() ){
			
			var currPos = generatePos(x,y);
			var prevPos = generatePos(x-1,y)
			var topsPos = generatePos(x,y-1)

			var currChar = test[y][x];
			var prevChar = test[y][x-1];

			if(char == "*"){
				tresuresList.push(currPos)
			}

			if(prevChar != "#" && currChar != "#" && x > 0){
				connectionList.push(createConnection(currPos,prevPos));
			}

			if(y == 0)continue
			var topsChar = test[y-1][x];
			if(topsChar != "#" && currChar != "#" && y > 0){
				connectionList.push(createConnection(currPos,topsPos));
			}
		}
	}
	return connectionList
}










function createNode(x,y){
	return{
		"name":`${generateName(x,y)}`,
		"position":{
			"x":x,
			"y":y
		},
		"connections": [],
		"astar":{
			"Fcost":10000,
			"heuristic": 0,
			"distance":0,
			"visited":false,
			"previousNode":null
		}
	}
}

function generateName(x,y){
	return `[${x}, ${y}]`
}

function generateAllNodes(test, start){
	var nodesList = {};
	for ( const [y, arr] of test.entries() ){
		for( const [x, char] of arr.entries() ){
			
			if(char == "#")continue

			var currPos = generateName(x,y);
			var prevPos = generateName(x-1,y)
			var topsPos = generateName(x,y-1)

			var currChar = test[y][x];
			var prevChar = test[y][x-1];

			nodesList[currPos] = createNode(x,y)

			if(char == "*"){
				tresuresList.push([x,y])
			}

			if(prevChar != "#" && currChar != "#" && x > 0){
				nodesList[currPos].connections.push(prevPos)
				nodesList[prevPos].connections.push(currPos)
			}

			if(y == 0)continue
			var topsChar = test[y-1][x];
			if(topsChar != "#" && currChar != "#" && y > 0){
				nodesList[currPos].connections.push(topsPos)
				nodesList[topsPos].connections.push(currPos)
			}
		}
	}
	return nodesList
}













function calculateDistance(srcX,srcY, dstX,dstY){
	deltaX = dstX - srcX
	deltaY = dstY - srcY
	return Math.sqrt(deltaX*deltaX + deltaY*deltaY) 
}

function calculateHeuristics(node,target){

	// tresuresList.map((value)=>{
	// 	return calculateDistance(node.position.x, node.position.y, value[0],value[1])
	// })
	// .reduce((cumulative, value) => cumulative + value)
	node.astar.heuristic = calculateDistance(node.position.x, node.position.y, target[0], target[1])
	node.astar.distance = node.astar.previousNode.astar.distance + 1
	node.astar.Fcost = node.astar.heuristic + node.astar.distance
	return node
}

function astar(nodesList,start,target){
	var Sx = start[0]
	var Sy = start[1]

	var tempList = nodesList

	var failsave = 0


	var currNode = tempList[generateName(Sx,Sy)]
	var finlNode = tempList[generateName(target[0],target[1])]
	

	var history = []
	var lowestFcost = tempList[generateName(Sx,Sy)]
	lowestFcost.astar.visited = true

	while(lowestFcost != finlNode){
		failsave ++;
		if(failsave > 200){
			console.log("wow... how did it get here ????")
			break
		}

		var openNode = lowestFcost.connections
		// console.log(lowestFcost)
		if(openNode.length == 1){
			traceback()
		}
		for (var xx of openNode){
			var tempNode = nodesList[xx]
			tempNode.astar.previousNode = lowestFcost
			if(tempNode.astar.visited) continue
			tempNode=calculateHeuristics(tempNode,target)

			if( tempNode.astar.Fcost < lowestFcost.astar.Fcost ){
				lowestFcost.astar.visited = true
				lowestFcost = tempNode
			}
			// console.log(nodesList[x])
		}
		lowestFcost.astar.Fcost = 10000
		currNode = lowestFcost
		history.push(lowestFcost.name)
	}
	return [lowestFcost, history]
}



// function compressTree(nodesList){

// }

function grabPosFromNode(node){
	return [node.position.x, node.position.y]
}


function grabAllRoutePossibility(nodesList){
	var nodeListBackup = JSON.stringify(nodesList);
	var allPossibleRoute = []
	for(var tresure of tresuresList){
		var result = astar(nodesList,start,tresure);
		allPossibleRoute.push(result[1])
		nodesList = JSON.parse(nodeListBackup);
	}
	return allPossibleRoute
}

var nodesList = generateAllNodes(test, start);
var allRoute = grabAllRoutePossibility(nodesList)
