document.addEventListener("DOMContentLoaded", () => {
  // 获取所有需要的DOM元素
  const messageWrapper = document.querySelector(".message-wrapper");
  if (!messageWrapper) return;

  const moreBtn = messageWrapper.querySelector(".more-btn");
  const contextMenu = messageWrapper.querySelector(".context-menu");
  const messageTitle = messageWrapper.querySelector(".message-title");

  // --- 菜单显示/隐藏逻辑 ---

  // 1. 点击三个点按钮，切换菜单的显示状态
  moreBtn.addEventListener("click", (event) => {
    // 阻止事件冒泡，防止立即触发下面的window点击事件
    event.stopPropagation();
    contextMenu.classList.toggle("show");
  });

  // 2. 点击菜单外部的任何地方，关闭菜单
  window.addEventListener("click", () => {
    if (contextMenu.classList.contains("show")) {
      contextMenu.classList.remove("show");
    }
  });

  // --- 菜单项功能逻辑 ---

  // 3. 重命名功能
  const renameBtn = document.getElementById("rename-btn");
  renameBtn.addEventListener("click", () => {
    const newTitle = prompt("请输入新的标题：", messageTitle.textContent);
    if (newTitle && newTitle.trim() !== "") {
      messageTitle.textContent = newTitle.trim();
    }
    contextMenu.classList.remove("show"); // 操作后关闭菜单
  });

  // 4. 删除功能
  const deleteBtn = document.getElementById("delete-btn");
  deleteBtn.addEventListener("click", () => {
    const isConfirmed = confirm("确定要删除这条消息吗？");
    if (isConfirmed) {
      messageWrapper.remove(); // 从DOM中移除整个消息组件
    }
    contextMenu.classList.remove("show"); // 操作后关闭菜单
  });

  // 5. 分享功能
  const shareBtn = document.getElementById("share-btn");
  shareBtn.addEventListener("click", () => {
    // 简单地使用 alert 提示
    alert("已复制分享链接到剪贴板！");
    // 如果需要实际复制到剪贴板，可以使用 navigator.clipboard API
    // const shareLink = window.location.href + "#" + messageWrapper.id; // 示例链接
    // navigator.clipboard.writeText(shareLink).then(() => {
    //   alert("已复制分享链接到剪贴板！");
    // }).catch(err => {
    //   console.error('无法复制链接: ', err);
    //   alert("复制失败！");
    // });
    contextMenu.classList.remove("show"); // 操作后关闭菜单
  });
});
