var iw = 900;
var ih = 900;
var h = 20;
var r = 10;

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
		if(read_data[i2] == 0){
			wall = dy;
		}
	}
	return wall;
}


function getFloorShadow(x,y,read_data){
	for(dx = 0; dx<=h; dx++){
		var i = getIndex(x,y);
		var i2 = getIndex(x-dx,y);
		if(read_data[i2] == 0 && read_data[i] != 0){
			return 1;
		}
	}	
}

function getShadow(x,y, read_data,wall){	
	if(wall == -1){
		return getFloorShadow(x,y,read_data);
	}else{
		for(dx = 0; dx<=h-wall; dx++){
			var i2 = getIndex(x-dx,1+y+wall);
			if(read_data[i2] == 0){
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
			if(read_data[index] == 0) result = Math.min(result,j);
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
			if(read_data[index] != 0) result = Math.min(result,j);
		}
	}
	if(result === r * 3){
		return -1;
	}else{
		return result
	}
}

var draw_dungeon = function(){
	var wall_img = document.createElement("img");
	wall_img.onload = function(){
		wall_canvas = document.createElement('canvas');
		wall_canvas.width = iw;
		wall_canvas.height= ih;
		var wall_ctx=wall_canvas.getContext("2d");
		wall_ctx.drawImage(wall_img,0,0,h,h);	
		var wall_imageData = wall_ctx.getImageData(0,0,h,h);
		var wall_data = wall_imageData.data;

		var dun_img = document.createElement("img");
		dun_img.onload = function(){
		var canvas = document.getElementById("dungeon_canvas");
			var ctx = canvas.getContext("2d");
			
			var input_canvas = document.createElement('canvas');
			input_canvas.width = iw;
			input_canvas.height= ih;
			var input_ctx=input_canvas.getContext("2d");
			input_ctx.drawImage(dun_img,0,0,iw,ih);
			var imageData = input_ctx.getImageData(0,0,iw, ih);
			var data = imageData.data;
			var read_data = JSON.parse(JSON.stringify(data));
			
			for(var x = 0; x < iw; x++){
				for(var y = 0; y < ih; y++){
					var i = getIndex(x,y);i
					var wall = getWallHeight(x,y, read_data);
					if(read_data[getIndex(x,y+h)]==0){
						var edge = getDistToFloor(x,y+h,read_data);
						var value = (edge/r)*256;
						if(edge > r/2) value = 256 * (1 - edge/r);
						data[i] = value;
						data[i+1] =value;
						data[i+2] =value;
					}else if(wall!=-1){
						wi = getIndex(x,wall,h,h);
						data[i] = wall_data[wi];
						data[i+1] = wall_data[wi+1];
						data[i+2] = wall_data[wi+2];
					}else if(read_data[i]!=0){
						var edge  = getDistToWall(x,y,read_data);
						if(edge==-1) edge = r;
						data[i] = 100 - (r-edge)/r*60;
						data[i+1] = 100 - (r-edge)/r*60;
						data[i+2] = 100 - (r-edge)/r*60;
					}else{
						data[i] = 0;
						data[i+1] =0;
						data[i+2] =0;
					}
					if(getShadow(x,y,read_data,wall)===1){
						data[i] *= 0.75;
						data[i+1] *= 0.75;
						data[i+2] *= 0.75;
					}
				}
			}
			document.getElementById("body").appendChild(input_canvas);
			ctx.putImageData(imageData, 0, 0);
		}	
		dun_img.src = "img/input_dungeon.png"; 	
	}
	wall_img.src = "img/wall.png"; 	
}


draw_dungeon();
