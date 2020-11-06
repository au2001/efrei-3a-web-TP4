<template>
  <div>
    <h1>Mon Panier</h1>
    <button class="pay" @click="pay()">Payer</button>
    <article v-for="article in articles_panier" :key="article.id">
      <div class="article-img">
        <div class="article" :style="{ backgroundImage: 'url(' + article.image + ')' }">
        </div>
      </div>
      <div class="article-content" v-if="editingArticle.id !== article.id">
        <div class="article-title">
          <h2>{{ article.name }} - {{ article.price }}€ x {{ article.quantity }}</h2>
        </div>
        <p class="description">{{ article.description }}</p>
        <div>
          <button class="delete" @click="deleteArticle(article.id)">Supprimer</button>
          <button class="modify" @click="editArticle(article)">Modifier</button>
        </div>
      </div>
      <div class="article-content" v-else>
        <div class="article-title">
          <h2>{{ article.name }} - {{ article.price }}€ x <input type="number" v-model="editingArticle.quantity"></h2>
          <div>
            <button class="validate" @click="sendEditQuantity()">Valider</button>
            <button class="delete" @click="abortEditQuantity()">Annuler</button>
          </div>
        </div>
        <p>{{ article.description }}</p>
      </div>
    </article>
  </div>
</template>

<script>
module.exports = {
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object },
    user: { type: Object }
  },
  data() {
    return {
      editingArticle: {
        id: -1,
        quantity: 0
      }
    }
  },
  computed: {
    articles_panier() {
      return this.panier.articles.map(article => ({
        ...article,
        ...this.articles.find(a => a.id === article.id)
      }))
    }
  },
  methods: {
    pay() {
      this.$emit('pay')
    },
    editArticle(article) {
      this.editingArticle.id = article.id
      this.editingArticle.quantity = article.quantity
    },
    sendEditQuantity() {
      this.$emit('update-panier', this.editingArticle)
      this.abortEditQuantity()
    },
    abortEditQuantity() {
      this.editingArticle = {
        id: -1,
        quantity: 0
      }
    }
  }
}
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}

article {
  display: flex;
  margin-bottom: 25px;
}

h2 {
  margin-bottom: 20px;
}

button {
  padding: 7.5px 10px;
  border-radius: 10px;
  border: none;
}

.pay {
  background-color: lightskyblue;
  margin-bottom: 20px;
}

.article {
  padding: 25px;
  border-radius: 25px;
  background: #ffffff;
  box-shadow:  20px 20px 60px #d9d9d9,
              -20px -20px 60px #ffffff;
}

.article-img {
  flex: 1;
}

.article-img div {
  width: 150px;
  height: 150px;
  background-size: cover;
}

.article-content {
  flex: 3;
}

.article-title {
  display: flex;
  justify-content: space-between;
}

.delete {
  background-color: lightcoral;
}

.modify {
  background-color: lightskyblue;
}

.description {
  margin-bottom: 10px;
}

.validate {
  background-color: lightgreen;
}

textarea {
  width: 100%;
}
</style>
