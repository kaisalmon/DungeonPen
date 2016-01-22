var iw = 500;
var ih = 500;
var h = 16;
var r = 6;

var images = {
	'wall':{'src':"wall.png", 'w':h, 'h':h},
	'floor':{'src':"wall.png", 'w':h, 'h':h},
	'dungeon':{'src':"input_dungeon.png"}
};

var image_promise = function(image){
	return new Promise(function(resolve, reject) {
		var img = document.createElement("img");
		img.onload = function(){
			canvas = document.createElement('canvas');
			if(image.w === undefined){
				canvas.width = iw;
				canvas.height= ih;
				image.h = canvas.height;
				image.w = canvas.width;
			}else{
				canvas.width = image.w;
				canvas.height = image.h;
			}
			var ctx=canvas.getContext("2d");
			ctx.drawImage(img,0,0,image.w,image.h);	
			var imageData = ctx.getImageData(0,0,image.w,image.h);	
			image.imageData = imageData;
			image.ctx = ctx;
			image.img = img;
			image.data = imageData.data;
			resolve(image);
		}
		img.src = "img/"+image.src;
		console.log(img.src);
	})
};

var all_images_promise = function(){
	var promises = Object.keys(images).map(function(key){ 
		return image_promise(images[key]);
	});
	return Promise.all(promises);
}


function getIndex(x,y,hi,wi){
	if(hi===undefined) hi = ih;
	if(wi===undefined) wi = ih;
	y = y % hi;
	x = x % wi;
	return (x+y*hi)*4;
}

function getWallHeight(x,y, read_data){	
	var wall = -1;
	for(dy = 0; dy<=h; dy++){
		var i2 = getIndex(x,y+dy);
		if(images.dungeon.data[i2] == 0){
			wall = dy;
		}
	}
	return wall;
}


function getFloorShadow(x,y,read_data){
	for(dx = 0; dx<=h; dx++){
		var i = getIndex(x,y);
		var i2 = getIndex(x-dx,y);
				if(images.dungeon.data[i2] == 0 && read_data[i] != 0){
			return 1;
		}
	}	
}

function getShadow(x,y, read_data,wall){	
	if(wall == -1){
		return getFloorShadow(x,y,images.dungeon.data);
	}else{
		for(dx = 0; dx<=h-wall; dx++){
			var i2 = getIndex(x-dx,1+y+wall);
			if(images.dungeon.data[i2] == 0){
				return 1;
			}
		}
	}
	return 0;
}

function getDistToWall(x,y,read_data){
	var dirs = [[+1,0],[-1,0],[0,+1],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]];
	var result = r * 3;
	for(var i = 0; i < 8; i++){
		var dir = dirs[i];
		for(var j = 0; j < r; j++){
			var index = getIndex(x+dir[0]*j, y+dir[1]*j);
			if(images.dungeon.data[index] == 0) result = Math.min(result,j);
		}
	}
	if(result === r * 3){
		return -1;
	}else{
		return result
	}
}

function getDistToFloor(x,y,read_data){
	var dirs = [[+1,0],[-1,0],[0,+1],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]];
	var result = r * 3;
	for(var i = 0; i < 8; i++){
		var dir = dirs[i];
		for(var j = 0; j < r; j++){
			var index = getIndex(x+dir[0]*j, y+dir[1]*j);
			if(images.dungeon.data[index+1] != 0) result = Math.min(result,j);
		}
	}
	if(result === r * 3){
		return -1;
	}else{
		return result
	}
}


var render_dungeon = function(){	
	console.log(images);
	var canvas = document.createElement("canvas"); 
	canvas.width = iw;
	canvas.height = ih;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(images.dungeon.img,0,0,iw,ih);
	var imageData = ctx.getImageData(0,0,iw,ih);
	var data = imageData.data;
	for(var x = 0; x < iw; x++){
		for(var y = 0; y < ih; y++){
			var i = getIndex(x,y);i
			var wall = getWallHeight(x,y, images.dungeon.data);
			if(images.dungeon.data[getIndex(x,y+h)+1]==0){
				var edge = getDistToFloor(x,y+h,images.dungeon.data);
				var value = (edge/r)*256;
				if(edge > r/2) value = 256 * (1 - edge/r);
				if(edge >= r) value = 60;
				data[i] = value;
				data[i+1] =value;
				data[i+2] =value;
			}else if(wall!=-1){
				var wi = getIndex(x,wall,h,h);
				data[i] = images.wall.data[wi];
				data[i+1] = images.wall.data[wi+1];
				data[i+2] = images.wall.data[wi+2];
				var wallLeft = getWallHeight(x-1,y, images.dungeon.data);
				var wallRight = getWallHeight(x+1,y, images.dungeon.data);
				var dWall = wall - wallLeft;
				var predWallRight = wall + dWall;
				var edge = 1;
				var diff = wallRight - predWallRight;
				if(diff>4 || diff < -4 || wallLeft == -1 || wallRight == -1){
					edge = 0.5;
				}
				data[i] *= edge;
				data[i+1] *=edge;
				data[i+2] *=edge;
				
			}else if(images.dungeon.data[i]!=0){
				var edge  = getDistToWall(x,y,images.dungeon.data);
				if(edge==-1) edge = r;
				data[i] = 100 - (r-edge)/r*80;
				data[i+1] = 100 - (r-edge)/r*80;
				data[i+2] = 100 - (r-edge)/r*80;
			}else{
				data[i] = 0;
				data[i+1] =0;
				data[i+2] =0;
			}
			if(getShadow(x,y,images.dungeon.data,wall)===1){
				data[i] *= 0.75;
				data[i+1] *= 0.75;
				data[i+2] *= 0.75;
			}
		}
	}
	document.getElementById("dungeon_canvas").getContext("2d").putImageData(imageData,0,0);
}

all_images_promise().then(function(arr){
	render_dungeon();
});
