document.addEventListener("DOMContentLoaded", function() {
    
    // 監視オプション（画面の15%くらいが見えたら発火）
    const options = {
        root: null, // ビューポートを基準
        rootMargin: "0px",
        threshold: 0.15 
    };

    // 交差監視API (Intersection Observer) の作成
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // 画面内に入ったかどうか
            if (entry.isIntersecting) {
                // クラスを追加してCSSアニメーションを開始
                entry.target.classList.add("visible");
                // 一度表示したら監視をやめる（パフォーマンスのため）
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // .fade-block クラスがついている全要素を監視対象にする
    const targets = document.querySelectorAll(".fade-block");
    targets.forEach(target => {
        observer.observe(target);
    });
});