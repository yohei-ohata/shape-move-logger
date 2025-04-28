(function () {
    var coordinates = [];
    var log = [];
    var fingers = []; 
    var shapes = [
        { id: "box1", index: 1 },
        { id: "circle1", index: 2 },
        { id: "triangle1", index: 3 },
        { id: "box2", index: 4 },
        { id: "circle2", index: 5 },
        { id: "triangle2", index: 6 },
    ];

    var maxTouches = 1; // マルチタッチを許可する最大のタッチ数
    var activeFingerIndex = null; // アクティブな指のインデックス

    var isLoggingEnabled = true; // ログの記録が有効かどうかのフラグ

    function getShapeIndex(x, y) {
        var shapeIndex = null;
        var touchedShapeZIndex = -Infinity;
    
        for (var i = 0; i < shapes.length; i++) {
            var shape = document.getElementById(shapes[i].id);
            var rect = shape.getBoundingClientRect();
    
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            var zIndex = window.getComputedStyle(shape).getPropertyValue("z-index");
    
            if (zIndex !== "auto" && parseInt(zIndex) > touchedShapeZIndex) {
                touchedShapeZIndex = parseInt(zIndex);
                shapeIndex = i;
            }
            }
        }
        return shapeIndex;
        }
    
    function addCoordinatesAndShapeCenter(event) {
        var touches = event.changedTouches;
        if (touches.length > maxTouches) {
            return;
        } else if (activeFingerIndex !== null) {
            var touch = touches[activeFingerIndex];
            var shapeIndex = getShapeIndex(touch.pageX, touch.pageY);
            if (shapeIndex !== null) {
                var shape = document.getElementById(shapes[shapeIndex].id);
                var rect = shape.getBoundingClientRect();
                var shapeX = (rect.left + rect.width / 2).toFixed(2);
                var shapeY = (rect.top + rect.height / 2).toFixed(2);

                var milliseconds = new Date().getMilliseconds().toString();
                if (milliseconds.length === 1) {
                    milliseconds = "00" + milliseconds;
                } else if (milliseconds.length === 2) {
                    milliseconds = "0" + milliseconds;
                }
                coordinates.push({
                    time: new Date().toLocaleTimeString() + "." + milliseconds,
                    eventType: event.type,
                    x: touch.pageX.toFixed(2),
                    y: touch.pageY.toFixed(2),
                    shapeIndex: shapes[shapeIndex].index,
                    shapeX: shapeX,
                    shapeY: shapeY,
                });
            } else {

                var milliseconds = new Date().getMilliseconds().toString();
                if (milliseconds.length === 1) {
                    milliseconds = "00" + milliseconds;
                } else if (milliseconds.length === 2) {
                    milliseconds = "0" + milliseconds;
                }

                coordinates.push({
                    time: new Date().toLocaleTimeString() + "." + milliseconds,
                    eventType: event.type,
                    x: touch.pageX.toFixed(2),
                    y: touch.pageY.toFixed(2),
                    shapeIndex: null,
                    shapeX: null,
                    shapeY: null,
                });
            }
        }
    }

    var intervalId;

    function pauseRecording() {
        recording = false;
        clearInterval(intervalId);
        if (coordinates.length > 0) {
            var lastLog = coordinates[coordinates.length - 1];
            console.log(lastLog);
            log.push(lastLog); // ログを配列に追加
        }
    }

    function stopRecording() {
        recording = false;
        clearInterval(intervalId);
        exportToCSV();
    }

    // CSVエクスポート
    function exportToCSV() {
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Time,Event Type,X,Y,Shape Index,Shape X,Shape Y\n"; // ヘッダー
        coordinates.forEach(function (coord) {
            csvContent += `${coord.time},${coord.eventType},${coord.x},${coord.y},${coord.shapeIndex},${coord.shapeX},${coord.shapeY}\n`;
        });
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "touch_log.csv");
        document.body.appendChild(link); // 適切な位置にリンクを追加
        link.click();
    }


    function handleTouchStart(event) {
        var touches = event.touches;
        if (touches.length > maxTouches) {
            return;
        } else {
            var fingerIndex = fingers.indexOf(null);
            if (fingerIndex >= 0) {
                fingers[fingerIndex] = touches[0].identifier; // タッチした指を登録
                addCoordinatesAndShapeCenter(event, fingerIndex);
                // touchend イベントハンドラを設定
                var touchEndHandler = function(e) {
                    if (fingers[fingerIndex] === e.changedTouches[0].identifier) {
                        // 正しい指に対する touchend イベントの場合
                        addCoordinatesAndShapeCenter(e, fingerIndex);
                        pauseRecording(); // 記録を停止
                        fingers[fingerIndex] = null; // 指を解放
                        document.removeEventListener("touchend", touchEndHandler); // イベントハンドラを解除
                        isLoggingEnabled = true; // touchend イベント発生時に記録を有効化
                    }
                };
                document.addEventListener("touchend", touchEndHandler);
            }
        }
    }

    // touchstart イベントを監視
    document.addEventListener("touchstart", function (event) {
        var touches = event.touches;
        if (touches.length > maxTouches) {
            return;
        } else {
            activeFingerIndex = 0; // 最初の指をアクティブとする
            handleTouchStart(event);
            pauseRecording(); // 記録を開始
        }
    });



    var initialShapePositions = {}; // 初期の図形の位置を保存するオブジェクト
    var isLoggingEnabled = true; // ログ記録が有効かどうかのフラグ
    
    // 図形が移動したかどうかを判定する関数
    function hasShapeMoved(shapeElement) {
        var rect = shapeElement.getBoundingClientRect();
        var initialPosition = initialShapePositions[shapeElement.id];
        return (
            rect.left !== initialPosition.left || 
            rect.top !== initialPosition.top
        );
    }
    
    // 図形の初期位置を初期化する関数
    function initializeInitialShapePositions() {
        // 初期の図形の位置を再度保存
        var shapeElements = document.getElementsByClassName("shape");
        for (var i = 0; i < shapeElements.length; i++) {
            var shapeElement = shapeElements[i];
            var rect = shapeElement.getBoundingClientRect();
            initialShapePositions[shapeElement.id] = {
                left: rect.left,
                top: rect.top
            };
        }
    }
    
    document.addEventListener("touchmove", function (event) {
        var touches = event.touches;
    
        // マルチタッチを検出
        if (touches.length > 1) {
            isLoggingEnabled = false; // マルチタッチが検出された場合、記録を無効化
            return;
        }
    
        // 全ての指が離れた場合、記録を有効化
        if (touches.length === 0) {
            isLoggingEnabled = true;
            return;
        }
    
        var touch = touches[0];
    
        // activeFingerIndex が null でない場合は最初の指が既にタッチされている状態
        if (activeFingerIndex !== null && isLoggingEnabled) {
            // 最初に触れていた指のみ処理
            if (activeFingerIndex === fingers.indexOf(touch.identifier)) {
                var shapeIndex = getShapeIndex(touch.pageX, touch.pageY);
                var shapeElement = shapeIndex !== null ? document.getElementById(shapes[shapeIndex].id) : null;
    
                // 図形が移動したかどうかをチェック
                if (shapeElement && hasShapeMoved(shapeElement)) {
                    var rect = shapeElement.getBoundingClientRect();
                    var shapeX = (rect.left + rect.width / 2).toFixed(2);
                    var shapeY = (rect.top + rect.height / 2).toFixed(2);
                    var milliseconds = new Date().getMilliseconds().toString();
                    if (milliseconds.length === 1) {
                        milliseconds = "00" + milliseconds;
                    } else if (milliseconds.length === 2) {
                        milliseconds = "0" + milliseconds;
                    }
    
                    var logEntry = {
                        time: new Date().toLocaleTimeString() + "." + milliseconds,
                        eventType: event.type,
                        x: touch.pageX.toFixed(2),
                        y: touch.pageY.toFixed(2),
                        shapeIndex: shapes[shapeIndex].index,
                        shapeX: shapeX,
                        shapeY: shapeY,
                    };
    
                    console.log(logEntry);
                    coordinates.push(logEntry);
                } else {
                    var milliseconds = new Date().getMilliseconds().toString();
                    if (milliseconds.length === 1) {
                        milliseconds = "00" + milliseconds;
                    } else if (milliseconds.length === 2) {
                        milliseconds = "0" + milliseconds;
                    }
    
                    var logEntry = {
                        time: new Date().toLocaleTimeString() + "." + milliseconds,
                        eventType: event.type,
                        x: touch.pageX.toFixed(2),
                        y: touch.pageY.toFixed(2),
                        shapeIndex: null,
                        shapeX: null,
                        shapeY: null,
                    };
    
                    console.log(logEntry);
                    coordinates.push(logEntry);
                }
            }
        }
    });
    
    // 画面を開いた時に図形の初期位置を保存
    window.addEventListener("load", function () {
        initializeInitialShapePositions();
    });
    
    document.addEventListener("touchend", function (event) {
        // touchend イベントを検出したら初期位置を再設定
        initializeInitialShapePositions();
    });


    for (var i = 0; i < maxTouches; i++) {
        fingers.push(null);
    }

    // エクスポートボタンのクリックイベント
    // document.getElementById("endButton").addEventListener("touchstart", function () {
    //     stopRecording();
    //     // window.location.href = "next_page.html"; // 遷移先のURLを設定
    // });

    document.getElementById("endButton").addEventListener("mousedown", function () {
        stopRecording();
        // window.location.href = "test.csv"; // 遷移先のURLを設定
    });


})();


window.addEventListener("load", function () {
    console.clear();
  });


