# 🔐 CryptoBox

**全能加解密工具箱** — 纯前端、本地运算、零服务器依赖

<p align="center">
  <img src="logo-square.svg" width="180" alt="CryptoBox Logo">
</p>

## ✨ 特性

- 🔒 **30+ 加密算法** — AES / DES / 3DES / ChaCha20 / Blowfish / RC4 / SM4 / RSA / ECC / Ed25519 / SM2
- #️⃣ **12+ 哈希算法** — MD5 / SHA 全系列 / SHA-3 / SM3 / BLAKE2b/3 / RIPEMD-160
- 🔄 **编码转换** — Base64 / Base32 / Hex / URL / Unicode / JWT
- 🛠️ **实用工具** — 密钥生成器 / JSON 工具(8+功能) / 证书解析 / 文本对比
- 📊 **操作历史** — 自动记录所有操作，支持筛选/搜索/重新执行/导入导出
- 🧪 **27+ 单元测试** — 内置测试套件，一键验证所有功能
- 🎨 **暗色主题** — 精心设计的 UI/UX，支持主题切换
- 📱 **响应式** — 适配桌面和移动端
- 🔐 **100% 本地** — 所有运算在浏览器端完成，数据不上传

## 🚀 使用

直接打开 `dark-svg.html` 即可使用，无需安装任何依赖。

**在线体验：** [https://yuxilong-labs.github.io/CryptoBox/](https://yuxilong-labs.github.io/CryptoBox/)

## 📦 功能模块

| 分类 | 算法/工具 |
|------|----------|
| 对称加密 | AES (CBC/ECB/CTR/GCM) · DES/3DES · ChaCha20 · Blowfish · RC4 · SM4 |
| 非对称加密 | RSA (加解密/签名) · ECC/ECDSA · Ed25519 · SM2 |
| 哈希 | MD5 · SHA-1/256/384/512 · SHA-3 · SM3 · BLAKE2b/3 · RIPEMD-160 |
| HMAC | HMAC-MD5 · HMAC-SHA256 · HMAC-SHA512 · HMAC-SM3 |
| 密码哈希 | bcrypt · PBKDF2 |
| 编码 | Base64/Base32 · Hex · URL · Unicode |
| JWT | 解码 · 编码 · 验签 |
| JSON | 格式化 · 压缩 · 转义 · 树形视图 · 格式转换 · 转代码 · Diff · JSONPath |
| 工具 | 密钥生成器 · 证书解析 · 文本对比 |

## 🧪 测试

在浏览器控制台运行：

```javascript
runAllTests()
```

或点击页面右上角「测试」按钮。

## 📄 License

MIT
