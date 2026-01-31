import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

import HomePage from './pages/HomePage.vue'
import AesPage from './pages/AesPage.vue'
import DesPage from './pages/DesPage.vue'
import ChaCha20Page from './pages/ChaCha20Page.vue'
import BlowfishPage from './pages/BlowfishPage.vue'
import Rc4Page from './pages/Rc4Page.vue'
import Sm4Page from './pages/Sm4Page.vue'
import RsaPage from './pages/RsaPage.vue'
import EccPage from './pages/EccPage.vue'
import Ed25519Page from './pages/Ed25519Page.vue'
import Sm2Page from './pages/Sm2Page.vue'
import HashPage from './pages/HashPage.vue'
import HmacPage from './pages/HmacPage.vue'
import PassHashPage from './pages/PassHashPage.vue'
import Base64Page from './pages/Base64Page.vue'
import HexUrlPage from './pages/HexUrlPage.vue'
import JwtPage from './pages/JwtPage.vue'
import JsonPage from './pages/JsonPage.vue'
import KeygenPage from './pages/KeygenPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage, meta: { title: '工作台' } },
  { path: '/aes', name: 'aes', component: AesPage, meta: { title: 'AES 加解密' } },
  { path: '/des', name: 'des', component: DesPage, meta: { title: 'DES / 3DES' } },
  { path: '/chacha20', name: 'chacha20', component: ChaCha20Page, meta: { title: 'ChaCha20' } },
  { path: '/blowfish', name: 'blowfish', component: BlowfishPage, meta: { title: 'Blowfish' } },
  { path: '/rc4', name: 'rc4', component: Rc4Page, meta: { title: 'RC4' } },
  { path: '/sm4', name: 'sm4', component: Sm4Page, meta: { title: 'SM4' } },
  { path: '/rsa', name: 'rsa', component: RsaPage, meta: { title: 'RSA' } },
  { path: '/ecc', name: 'ecc', component: EccPage, meta: { title: 'ECC / ECDSA' } },
  { path: '/ed25519', name: 'ed25519', component: Ed25519Page, meta: { title: 'Ed25519' } },
  { path: '/sm2', name: 'sm2', component: Sm2Page, meta: { title: 'SM2' } },
  { path: '/hash', name: 'hash', component: HashPage, meta: { title: 'Hash 通用' } },
  { path: '/hmac', name: 'hmac', component: HmacPage, meta: { title: 'HMAC' } },
  { path: '/passhash', name: 'passhash', component: PassHashPage, meta: { title: '密码哈希' } },
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
