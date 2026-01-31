import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

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
  { path: '/', redirect: '/aes' },
  { path: '/aes', name: 'aes', component: AesPage, meta: { title: 'AES 加解密', category: '对称加密' } },
  { path: '/des', name: 'des', component: DesPage, meta: { title: 'DES / 3DES', category: '对称加密' } },
  { path: '/chacha20', name: 'chacha20', component: ChaCha20Page, meta: { title: 'ChaCha20', category: '对称加密' } },
  { path: '/blowfish', name: 'blowfish', component: BlowfishPage, meta: { title: 'Blowfish', category: '对称加密' } },
  { path: '/rc4', name: 'rc4', component: Rc4Page, meta: { title: 'RC4', category: '对称加密' } },
  { path: '/sm4', name: 'sm4', component: Sm4Page, meta: { title: 'SM4', category: '对称加密' } },
  { path: '/rsa', name: 'rsa', component: RsaPage, meta: { title: 'RSA', category: '非对称加密' } },
  { path: '/ecc', name: 'ecc', component: EccPage, meta: { title: 'ECC / ECDSA', category: '非对称加密' } },
  { path: '/ed25519', name: 'ed25519', component: Ed25519Page, meta: { title: 'Ed25519', category: '非对称加密' } },
  { path: '/sm2', name: 'sm2', component: Sm2Page, meta: { title: 'SM2', category: '非对称加密' } },
  { path: '/hash', name: 'hash', component: HashPage, meta: { title: 'Hash 通用', category: '哈希' } },
  { path: '/hmac', name: 'hmac', component: HmacPage, meta: { title: 'HMAC', category: '哈希' } },
  { path: '/passhash', name: 'passhash', component: PassHashPage, meta: { title: '密码哈希', category: '哈希' } },
  { path: '/base64', name: 'base64', component: Base64Page, meta: { title: 'Base64 / Base32', category: '编码' } },
  { path: '/hex', name: 'hex', component: HexUrlPage, meta: { title: 'Hex / URL', category: '编码' } },
  { path: '/jwt', name: 'jwt', component: JwtPage, meta: { title: 'JWT', category: '编码' } },
  { path: '/json', name: 'json', component: JsonPage, meta: { title: 'JSON 工具', category: '工具' } },
  { path: '/keygen', name: 'keygen', component: KeygenPage, meta: { title: '密钥生成器', category: '工具' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
