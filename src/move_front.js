(function() {
    let count = 0;
    let eleShape = document.getElementsByClassName("shape");

    for (var i = 0; i < eleShape.length; i++) {
        eleShape[i].style.zIndex = 0;
    }

    for (var i = 0; i < eleShape.length; i++) {
        eleShape[i].addEventListener("touchstart", moveFront, true);
        // showZIndex(eleShape[i]);
    }
    function moveFront(e) {
        count++;
        // すべての図形のz-indexを一旦0にリセットしてから、クリックされた図形を最前面に移動

        e.target.style.zIndex = count;
        // z-indexを更新した後に各図形のz-indexを表示
        for (var i = 0; i < eleShape.length; i++) {
            // showZIndex(eleShape[i]);
        }
    }
    function showZIndex(eleShape) {
        eleShape.getElementsByClassName("shape_text")[0].innerText = eleShape.style.zIndex;
    }
})();