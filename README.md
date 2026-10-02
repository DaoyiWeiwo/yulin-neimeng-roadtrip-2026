# 惠州 · 深圳 · 珠海 · 顺德 · 佛山六晚七日攻略

这是可直接发布的静态网页源文件。网站入口由 Cloudflare Pages 自动生成，源文件是：

`国庆广东游.html`

公开地址：<https://guide.zhldai.com/>

## 更新网页

修改源文件后提交并推送到 `main`：

```bash
git add '国庆广东游.html' .github/workflows/cloudflare-pages.yml README.md
git commit -m "更新自驾攻略"
git push
```

推送成功后，GitHub Actions 会重新发布到 Cloudflare Pages。网页地址保持不变，通常等待约 1 分钟即可看到最新版；已打开网页的人刷新后也会加载新版本。

工作流会自动生成 `index.html`，并复制攻略引用的一卡通权益页面与图片资源，因此不需要手动改文件名或上传资源。
