// スクロール禁止
document.addEventListener('touchmove', disableScroll, { passive: false });
document.addEventListener('mousewheel', disableScroll, { passive: false });

// スクロールを禁止にする関数
function disableScroll(event) {
    event.preventDefault();
}

(function () {
    var elements = document.getElementsByClassName("drag-and-drop");

    var areaElement = document.querySelector(".area");
    var areaRect = areaElement.getBoundingClientRect();

    var areaTop = areaRect.top;
    var areaLeft = areaRect.left;
    var areaWidth = areaRect.width;
    var areaHeight = areaRect.height;

    // 要素内のタッチされた位置を取得するグローバル変数
    var x;
    var y;
    var activeFingerIdentifier = null; // アクティブな指の識別子
    var activeFingerCount = 0; // アクティブな指の数
    var secondFingerDetected = false; // 2番目の指が検出されたか
    var isMovingEnabled = true; // 図形の移動が有効かどうかのフラグ

    // タッチが要素内で始まったときに発火
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener("touchstart", touchStart, false);
    }

    // タッチが始まった際の関数
    function touchStart(e) {
        // タッチが1つでない場合、処理を行わない
        if (e.touches.length !== 1) {
            return;
        }
        // アクティブな指を記録
        activeFingerIdentifier = e.touches[0].identifier;
        activeFingerCount = 1;

        // クラス名に .drag を追加
        this.classList.add("drag");

        // タッチイベントから最初のタッチ位置を取得
        var event = e.changedTouches[0];

        // 要素内の相対座標を計算
        x = event.pageX - this.offsetLeft;
        y = event.pageY - this.offsetTop;

        // タッチムーブイベントにコールバック
        this.addEventListener("touchmove", touchMove, false);
        this.addEventListener("touchend", touchEnd, false);
    }

    // タッチムーブイベントが発生したときに発火
    function touchMove(e) {
        // アクティブな指が変更された場合、処理を行わない
        if (e.touches.length !== activeFingerCount || e.touches[0].identifier !== activeFingerIdentifier) {
            return;
        }

        e.preventDefault();

        if (!isMovingEnabled) {
            return; // 移動が禁止されている場合、処理を行わない
        }

        // ドラッグしている要素を取得
        var drag = this;
        var dragElement = drag.getBoundingClientRect();
        var dragElementWidth = dragElement.width;
        var dragElementRight = dragElement.right;

        // タッチイベントから最初のタッチ位置を取得
        var event = e.changedTouches[0];

        // デフォルトのタッチスクロールを無効化
        e.preventDefault();

        // ドラッグした場所に要素を移動
        var newLeft = event.pageX - x;
        if (newLeft < areaLeft) {
            newLeft = areaLeft;
        } else if (newLeft + dragElementWidth > areaLeft + areaWidth) {
            newLeft = areaLeft + areaWidth - dragElementWidth;
        }
        drag.style.left = newLeft + "px";

        var newTop = event.pageY - y;
        if (newTop < areaTop) {
            newTop = areaTop;
        } else if (newTop + dragElement.height > areaTop + areaHeight) {
            newTop = areaTop + areaHeight - dragElement.height;
        }
        drag.style.top = newTop + "px";
    }

    // タッチが終了したときに発火
    function touchEnd(e) {
        // アクティブな指が離れた場合、処理を行わない
        if (e.changedTouches[0].identifier !== activeFingerIdentifier) {
            return;
        }

        // アクティブな指の数を減少
        activeFingerCount--;

        // アクティブな指が全てなくなった場合、フラグを元に戻す
        if (activeFingerCount === 0) {
            secondFingerDetected = false;
            isMovingEnabled = true; // すべての指が離れたので移動を再有効化
        }

        // タッチムーブイベントリスナーの削除
        this.removeEventListener("touchmove", touchMove, false);
        this.removeEventListener("touchend", touchEnd, false);

        // クラス名 .drag を削除
        this.classList.remove("drag");
    }

    // グローバルなタッチムーブイベントリスナーを追加
    document.addEventListener("touchmove", globalTouchMove, false);

    // グローバルなタッチムーブイベントが発生したときに発火
    function globalTouchMove(e) {
        // マルチタッチが検出された場合、移動を禁止
        if (e.touches.length > 1) {
            isMovingEnabled = false;
        }
    }
})();