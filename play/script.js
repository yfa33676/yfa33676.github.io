let player;
let videoData = [];
let currentIndex = 0;
let remainingTimeInterval;

// YouTube APIの準備
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: '',  // 初期動画はなし
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// プレイヤーが準備できたときに呼ばれる
function onPlayerReady(event) {
    console.log("YouTube Player Ready");
}

// 動画再生の状態が変わったときに呼ばれる
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        playNextVideo();
    }
}

// CSVファイルを読み込んでパースする関数
function readCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const csv = event.target.result;
        const rows = csv.split("\n");

        videoData = [];  // リセット
        currentIndex = 0;  // インデックスリセット
        document.getElementById('playlistItems').innerHTML = '';  // プレイリストクリア

        // CSVの各行をパースして配列に追加し、プレイリストを表示
        rows.forEach((row, index) => {
            const [title, videoId, startTime, duration] = row.split(",");
            videoData.push({
                title: title.trim(),
                videoId: videoId.trim(),
                startTime: parseInt(startTime.trim()),
                duration: parseInt(duration.trim())
            });

            // プレイリストの項目を作成して追加
            const li = document.createElement("li");
            li.textContent = title.trim();
            li.setAttribute("data-index", index);
            document.getElementById('playlistItems').appendChild(li);
        });

        // 最初の動画を再生開始
        playNextVideo();
    };
    reader.readAsText(file);
}

// プレイリストの表示を更新（現在の動画をハイライト）
function updatePlaylistDisplay() {
    const playlistItems = document.querySelectorAll('#playlistItems li');
    playlistItems.forEach((item, index) => {
        item.classList.remove('playing');  // ハイライト解除
        if (index === currentIndex) {
            item.classList.add('playing');  // 現在の動画をハイライト
        }
    });
}

// 次の動画を再生する関数
function playNextVideo() {
    clearInterval(remainingTimeInterval);

    if (currentIndex < videoData.length) {
        const video = videoData[currentIndex];
        
        // プレイヤーに動画IDと開始時刻をセット
        player.loadVideoById({
            videoId: video.videoId,
            startSeconds: video.startTime
        });

        // タイトル表示
        document.getElementById('title').textContent = video.title;

        // プレイリストのハイライトを更新
        updatePlaylistDisplay();

        // 残り時間表示をカウントダウン
        let remainingTime = video.duration;
        document.getElementById('remainingTime').textContent = `残り再生時間: ${remainingTime} 秒`;

        remainingTimeInterval = setInterval(() => {
            remainingTime--;
            document.getElementById('remainingTime').textContent = `残り再生時間: ${remainingTime} 秒`;

            if (remainingTime <= 0) {
                clearInterval(remainingTimeInterval);
                currentIndex++;
                playNextVideo();  // 再生時間が終了したら次の動画に移る
            }
        }, 1000);

    } else {
        console.log("すべての動画が再生されました。");
        document.getElementById('title').textContent = "再生終了";
        document.getElementById('remainingTime').textContent = "-- 秒";
    }
}

// 次の動画に強制的に進むためのボタンの処理
document.getElementById('nextButton').addEventListener('click', function() {
    currentIndex++;
    playNextVideo();
});

// CSVファイルが選択されたときの処理
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        readCSVFile(file);
    }
});
