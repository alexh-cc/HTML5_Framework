alex.display.MaskJpeg = function(jpegImg,pngMask,callback){
	var txImg = jpegImg;
	var txMask = pngMask;
	//create new canvas object and draw each image into it
	var canvasImg = document.createElement('canvas');
	//what are the dimensions?
	canvasImg.width = txImg.width;
	canvasImg.height = txImg.height;
	var ctxImg = canvasImg.getContext("2d");
	ctxImg.drawImage(txImg,0,0);
	ctxImg.globalCompositeOperation = 'xor';
	ctxImg.drawImage(txMask,0,0);
	var img = new Image();
	if(callback){
		img.onload = function(){
			callback(img);
		};
	}	
	img.src = canvasImg.toDataURL();
	return img;
};