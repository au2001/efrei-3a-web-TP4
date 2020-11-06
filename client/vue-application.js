const Home = window.httpVueLoader('./components/Home.vue')
const Panier = window.httpVueLoader('./components/Panier.vue')
const Register = window.httpVueLoader('./components/Register.vue')
const Login = window.httpVueLoader('./components/Login.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/panier', component: Panier },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
]

const router = new VueRouter({
  routes
})

var app = new Vue({
  router,
  el: '#app',
  data: {
    articles: [],
    panier: {
      createdAt: null,
      updatedAt: null,
      articles: []
    },
    user: null
  },
  mounted() {
    this.loadArticles()
    this.loadPanier()
    this.loadUser()
  },
  methods: {
    async register(credentials) {
      try {
        await axios.post('/api/register', credentials)
        await axios.post('/api/login', credentials)
        await this.loadUser()
      } catch (e) {
        alert("Email déjà pris.")
      }
    },
    async login(credentials) {
      try {
        await axios.post('/api/login', credentials)
        await this.loadUser()
      } catch (e) {
        alert("E-mail ou mot de passe incorrect.")
      }
    },
    async logout() {
      try {
        await axios.post('/api/logout')
        this.user = null
      } catch (e) {
        alert("Non connecté.")
      }
    },
    async loadUser() {
      try {
        const res = await axios.get('/api/me')
        this.user = res.data
      } catch (e) {
        this.user = null
      }
    },
    async loadArticles() {
      try {
        const res = await axios.get('/api/articles')
        this.articles = res.data
      } catch (e) {
        alert("Erreur pour charger les articles.")
      }
    },
    async loadPanier() {
      try {
        const res = await axios.get('/api/panier')
        this.panier = res.data
      } catch (e) {
        alert("Erreur pour charger le panier.")
      }
    },
    async addArticle(article) {
      try {
        const res = await axios.post('/api/article', article)
        this.articles.push(res.data)
      } catch (e) {
        alert("Erreur pour créer l'article.")
      }
    },
    async updateArticle(newArticle) {
      try {
        await axios.put('/api/article/' + newArticle.id, newArticle)
        const article = this.articles.find(a => a.id === newArticle.id)
        article.name = newArticle.name
        article.description = newArticle.description
        article.image = newArticle.image
        article.price = newArticle.price
      } catch (e) {
        alert("Erreur pour modifier l'article.")
      }
    },
    async deleteArticle(articleId) {
      try {
        await axios.delete('/api/article/' + articleId)
        const index = this.articles.findIndex(a => a.id === articleId)
        this.articles.splice(index, 1)
      } catch (e) {
        alert("Erreur pour supprimer l'article.")
      }
    },
    async addToPanier(articleId) {
      const article = {
        id: articleId,
        quantity: 1
      }
      try {
        const res = await axios.post('/api/panier', article)
        this.panier.articles.push(article)
        this.panier.updatedAt = new Date()
      } catch (e) {
        alert("Erreur pour ajouter l'article au panier.")
      }
    },
    async removeFromPanier(articleId) {
      try {
        await axios.delete('/api/panier/' + articleId)
        const index = this.panier.articles.findIndex(a => a.id === articleId)
        this.panier.articles.splice(index, 1)
        this.panier.updatedAt = new Date()
      } catch (e) {
        alert("Erreur pour retirer l'article du panier.")
      }
    },
    async updatePanier(newArticle) {
      try {
        await axios.put('/api/panier/' + newArticle.id, newArticle)
        const article = this.panier.articles.find(a => a.id === newArticle.id)
        article.quantity = newArticle.quantity
        this.panier.updatedAt = new Date()
      } catch (e) {
        alert("Erreur pour changer la quantité de l'article.")
      }
    },
    async pay() {
      try {
        const res = await axios.post('/api/panier/pay')
        this.panier.articles.splice(0, this.panier.articles.length)
        this.panier.updatedAt = new Date()
      } catch (e) {
        router.push('/login')
      }
    }
  }
})
