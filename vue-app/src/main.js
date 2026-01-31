import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

import HomePage from './pages/HomePage.vue'
import AesPage from './pages/AesPage.vue'
import DesPage from './pages/DesPage.vue'
import RsaPage from './pages/RsaPage.vue'
import HashPage from './pages/HashPage.vue'
import HmacPage from './pages/HmacPage.vue'
import Base64Page from './pages/Base64Page.vue'
import HexUrlPage from './pages/HexUrlPage.vue'
import JwtPage from './pages/JwtPage.vue'
import JsonPage from './pages/JsonPage.vue'
import KeygenPage from './pages/KeygenPage.vue'
import PlaceholderPage from './pages/PlaceholderPage.vue'

// Wrapper for placeholder pages
import { h } from 'vue'
const ph = (title, desc, icon) => ({
  render: () => h(PlaceholderPage, { title, desc, icon })
})

const routes = [
  { path: '/', name: 'home', component: HomePage, meta: { title: '工作台' } },
  { path: '/aes', name: 'aes', component: AesPage, meta: { title: 'AES 加解密' } },
  { path: '/des', name: 'des', component: DesPage, meta: { title: 'DES / 3DES' } },
  { path: '/chacha20', name: 'chacha20', component: ph('ChaCha20', 'ChaCha20-Poly1305 流加密', '⚡'), meta: { title: 'ChaCha20' } },
  { path: '/blowfish', name: 'blowfish', component: ph('Blowfish', 'Blowfish 对称加密', '🛡'), meta: { title: 'Blowfish' } },
  { path: '/rc4', name: 'rc4', component: AesPage, meta: { title: 'RC4' } }, // TODO: RC4 page
  { path: '/sm4', name: 'sm4', component: ph('SM4', 'SM4 国密对称加密', '🔒'), meta: { title: 'SM4' } },
  { path: '/rsa', name: 'rsa', component: RsaPage, meta: { title: 'RSA' } },
  { path: '/ecc', name: 'ecc', component: ph('ECC / ECDSA', '椭圆曲线加密与签名', '🔑'), meta: { title: 'ECC' } },
  { path: '/ed25519', name: 'ed25519', component: ph('Ed25519', 'Ed25519 签名', '✍️'), meta: { title: 'Ed25519' } },
  { path: '/sm2', name: 'sm2', component: ph('SM2', 'SM2 国密非对称加密', '🔐'), meta: { title: 'SM2' } },
  { path: '/hash', name: 'hash', component: HashPage, meta: { title: 'Hash 通用' } },
  { path: '/hmac', name: 'hmac', component: HmacPage, meta: { title: 'HMAC' } },
  { path: '/passhash', name: 'passhash', component: ph('密码哈希', 'bcrypt / PBKDF2 / scrypt / Argon2', '🔑'), meta: { title: '密码哈希' } },
  { path: '/base64', name: 'base64', component: Base64Page, meta: { title: 'Base64 / Base32' } },
  { path: '/hex', name: 'hex', component: HexUrlPage, meta: { title: 'Hex / URL' } },
  { path: '/jwt', name: 'jwt', component: JwtPage, meta: { title: 'JWT' } },
  { path: '/json', name: 'json', component: JsonPage, meta: { title: 'JSON 工具' } },
  { path: '/keygen', name: 'keygen', component: KeygenPage, meta: { title: '密钥生成器' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
