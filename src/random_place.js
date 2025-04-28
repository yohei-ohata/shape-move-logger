// 図形のランダム配置
(function(){
	// .palet要素の位置とサイズを取得
	var paletElement = document.querySelector(".palet");
	var paletRect = paletElement.getBoundingClientRect();
	var paletTop = paletRect.top;
	var paletLeft = paletRect.left;
	var paletWidth = paletRect.width;
	var paletHeight = paletRect.height;

	// ランダムな位置を計算する関数（.paletの範囲内）
	function getRandomPositionWithinPalet(element) {
		var randomX = Math.random() * (paletWidth - element.clientWidth);
		var randomY = Math.random() * (paletHeight - element.clientHeight);
		var positionX = paletLeft + randomX;
		var positionY = paletTop + randomY;
		return { x: positionX, y: positionY };
	}

	// ランダムな位置に要素を配置する関数（.paletの範囲内）
	function setRandomPositionWithinPalet(element) {
		var position = getRandomPositionWithinPalet(element);
		element.style.left = position.x + "px";
		element.style.top = position.y + "px";
	}

	// 画面を開いた時にランダムな位置に要素を配置（.paletの範囲内）
	window.addEventListener("load", function() {
		var shapeElements = document.getElementsByClassName("shape");
		for (var i = 0; i < shapeElements.length; i++) {
			var shapeElement = shapeElements[i];
			setRandomPositionWithinPalet(shapeElement);
			// 重ならないように要素の位置を調整
			for (var j = 0; j < i; j++) {
				var previousElement = shapeElements[j];
				var previousRect = previousElement.getBoundingClientRect();
				var shapeRect = shapeElement.getBoundingClientRect();
				if (isOverlap(previousRect, shapeRect)) {
					setRandomPositionWithinPalet(shapeElement);
					j = -1; // 重なりが解消されるまで繰り返す
				}
			}
		}
	});


	// 2つの要素が重なっているかを判定する関数
	function isOverlap(rect1, rect2) {
		return (
			rect1.left < rect2.right &&
			rect1.right > rect2.left &&
			rect1.top < rect2.bottom &&
			rect1.bottom > rect2.top
		);
	}
})();


// 通信状況が良くない場合はアラート
(function(){
	window.addEventListener('load', function() {
		checkNetworkStatus();
	});

	// 通信状況をチェックしてアラートを表示
	function checkNetworkStatus() {
		if (!navigator.onLine) {
			alert("通信状況が良くありません。Wi-Fiに接続してください。");
		}
	}
})();