document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       1. 星の生成とアニメーション
       ========================================= */
    const bgCanvas = document.getElementById('bg-canvas');
    const starCount = 60; // 星の数
    // 画像パスが正しいか確認してください
    const starImages = ['images/star_1.png', 'images/star_2.png'];

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('img');
        star.src = starImages[Math.floor(Math.random() * starImages.length)];
        star.classList.add('star');
        star.alt = ""; // 装飾用なのでaltは空
        
        // 位置をランダムに
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // 【修正】サイズを小さくする (コンテンツの邪魔にならないように)
        // 以前: 10px~30px -> 今回: 2px ~ 12px
        const size = Math.random() * 10 + 2; 
        
        // アニメーションの遅延
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 3; // 少しゆっくりに

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        star.style.animationDuration = `${duration}s`;

        // エラーハンドリング（画像がない場合は非表示）
        star.onerror = function() {
            this.style.display = 'none';
        };

        bgCanvas.appendChild(star);
    }

    /* =========================================
       2. ナビゲーションメニューの制御
       ========================================= */
    const menuBtn = document.getElementById('menuToggle');
    const navLinks = document.querySelectorAll('.nav-link');

    // ハンバーガーメニュー開閉
    menuBtn.addEventListener('click', () => {
        document.body.classList.toggle('menu-open');
    });

    // リンクをクリックしたらメニューを閉じる
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('menu-open');
        });
    });

    /* =========================================
       3. スクロールアニメーション (Intersection Observer)
       ========================================= */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // セクション装飾のbar画像のアニメーション連動
                const bar = entry.target.querySelector('.title-decoration');
                if(bar) {
                    bar.style.opacity = '1';
                    bar.style.transform = 'translateY(0)';
                }
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => observer.observe(el));
});