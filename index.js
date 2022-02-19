const Canvas = require('canvas')
const express = require("express");
const { Chess } = require("chess.js");

const app = express();
const piece = {};
const analysisIcons = {
	brilhante: "https://i.ibb.co/MNcpJmr/brilhante.png",
	melhor: "https://i.ibb.co/wSVmfNT/melhor.png",
	bom: "https://i.ibb.co/5KT5gsK/bom.png",
	capivarada: "https://i.ibb.co/7NVxTQm/capivarada.png",
	deslize: "https://i.ibb.co/b175TJ4/deslize.png",
	excelente: "https://i.ibb.co/fY5x1G5/excelente.png",
	forcado: "https://i.ibb.co/ZmdKGmb/forcado.png",
	imprudente: "https://i.ibb.co/yXQWttF/imprudente.png",
	livro: "https://i.ibb.co/K7JyfdC/livro.png",
	vitoriaperdida: "https://i.ibb.co/znBCtqV/vitoria-perdida.png"
}

async function drawBoard(canvas, context){
	if(!piece["back"]){
		piece["back"] = await Canvas.loadImage('https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/ColinStapczynski/phprnyp9x.png');
	}
	
	context.drawImage(piece["back"], 0, 0, canvas.width, canvas.height);
}

const pieces = async (theme, name, color) => {
	if(piece[theme+name+color]) return piece[theme+name+color];
	let url = "https://raw.githubusercontent.com/andyruwruw/chessimage/HEAD/src/resources/"+theme+"/";
	if(color == "w"){
		url += "White";
	}else{
		url += "Black";
	}
	if(name == "k") url += "King";
	if(name == "q") url += "Queen";
	if(name == "r") url += "Rook";
	if(name == "n") url += "Knight";
	if(name == "b") url += "Bishop";
	if(name == "p") url += "Pawn";
	url += ".png";
	piece[theme+name+color] = await Canvas.loadImage(url);
	return piece[theme+name+color];
}

async function drawPieces(board, theme, canvas, context, data, odata){

	if(data.e){
		context.fillStyle = 'green';
		context.fillRect(data.y*64, data.x*64, 64, 65);
		context.fillStyle = 'green';
		context.fillRect(odata.y*64, odata.x*64, 64, 65);
	}
	for(let y = 0; y < 8; y++){
		for(let x = 0; x < 8; x++){
			if(board[y][x]){
				const piecea = await pieces(theme, board[y][x].type, board[y][x].color);
				context.drawImage(piecea, x*64, y*64, 64, 64);
			}
		}
	}

	if(odata && odata.analysis){
		if(analysisIcons[odata.analysis]){
			const icon = await Canvas.loadImage(analysisIcons[odata.analysis]);
			context.drawImage(icon, (odata.y*64)+33, odata.x*64+1, 30, 30);
		}
	}
	
}

app.get("/", async function(req, res){
	let { fen, move, analysis } = req.query;
	if(!fen){
		return res.send("Você tem que definir o FEN");
	}
	const chess = new Chess();
	if(!chess.load(fen)){
		return res.send("Fen invalido");
	}
	let board = chess.board();
	const canvas = Canvas.createCanvas(512, 512);
	const context = canvas.getContext('2d');
	// Fundo
	await drawBoard(canvas, context)
	// Movimento
	let data = { e: false};
	let odata = {};
	if(move){
		let m = move.split("-");
		if(m.length === 2){
			let y = ["a", "b", "c", "d", "e", "f", "g", "h"];
			let x = ["8", "7", "6", "5", "4", "3", "2", "1"];
			data.y = y.findIndex(e => m[0].startsWith(e));
			data.x = x.findIndex(e => m[0][1] == e);
			odata.y = y.findIndex(e => m[1].startsWith(e));
			odata.x = x.findIndex(e => m[1][1] == e);
			if(analysis){
				odata.analysis = analysis;
			}
			data.e = true;
		}
	}
	await drawPieces(board, "cburnett", canvas, context, data, odata);
	res.type("png");
	res.end(canvas.toBuffer(), "binary");
});

app.listen(80, () => {
	console.log("Servidor Aberto");
});
process.on('uncaughtException', (err, origin) => {
  console.log(err, origin);
});
