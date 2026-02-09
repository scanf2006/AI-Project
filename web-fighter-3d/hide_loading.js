// 临时修复：手动隐藏加载屏幕
// 在浏览器控制台运行此代码

setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 500);
        console.log('加载屏幕已手动隐藏');
    }
}, 1000);
