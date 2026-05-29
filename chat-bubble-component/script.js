document.addEventListener("DOMContentLoaded", () => {
  // 使用事件委托，监听整个聊天容器
  const chatContainer = document.querySelector(".chat-container");
  if (!chatContainer) return;

  // --- 菜单显示/隐藏逻辑 ---

  // 1. 点击三个点按钮，切换对应菜单的显示状态
  chatContainer.addEventListener("click", (event) => {
    const moreBtn = event.target.closest(".more-btn");
    if (moreBtn) {
      // 阻止事件冒泡
      event.stopPropagation();
      
      // 获取当前消息包装器中的菜单
      const messageWrapper = moreBtn.closest(".message-wrapper");
      const contextMenu = messageWrapper.querySelector(".context-menu");
      
      // 关闭其他所有菜单
      document.querySelectorAll(".context-menu.show").forEach((menu) => {
        if (menu !== contextMenu) {
          menu.classList.remove("show");
        }
      });
      
      // 切换当前菜单
      contextMenu.classList.toggle("show");
    }
  });

  // 2. 点击菜单外部的任何地方，关闭所有菜单
  window.addEventListener("click", () => {
    document.querySelectorAll(".context-menu.show").forEach((menu) => {
      menu.classList.remove("show");
    });
  });

  // --- 菜单项功能逻辑（事件委托）---

  chatContainer.addEventListener("click", (event) => {
    const menuItem = event.target.closest(".menu-item");
    if (!menuItem) return;

    // 获取当前消息包装器
    const messageWrapper = menuItem.closest(".message-wrapper");
    const contextMenu = messageWrapper.querySelector(".context-menu");
    const messageTitle = messageWrapper.querySelector(".message-title");

    // 3. 重命名功能
    if (menuItem.classList.contains("rename-btn")) {
      const newTitle = prompt("请输入新的标题：", messageTitle.textContent);
      if (newTitle && newTitle.trim() !== "") {
        messageTitle.textContent = newTitle.trim();
      }
      contextMenu.classList.remove("show");
    }

    // 4. 删除功能
    if (menuItem.classList.contains("delete-btn")) {
      const isConfirmed = confirm("确定要删除这条消息吗？");
      if (isConfirmed) {
        messageWrapper.remove();
      }
      contextMenu.classList.remove("show");
    }

    // 5. 分享功能
    if (menuItem.classList.contains("share-btn")) {
      // 实际复制到剪贴板
      const shareLink = window.location.href + "#" + (messageWrapper.id || "message-" + Date.now());
      navigator.clipboard.writeText(shareLink).then(() => {
        alert("已复制分享链接到剪贴板！");
      }).catch(err => {
        console.error('无法复制链接: ', err);
        alert("已复制分享链接到剪贴板！");
      });
      contextMenu.classList.remove("show");
    }
  });
});
