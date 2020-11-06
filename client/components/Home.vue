<template>
  <div>
    <h1>Liste des articles</h1>
    <article v-for="article in articles" :key="article.id">
      <div class="article-img">
        <div class="article" :style="{ backgroundImage: 'url(' + article.image + ')' }">
        </div>
      </div>
      <div class="article-content" v-if="editingArticle.id !== article.id">
        <div class="article-title">
          <h2>{{ article.name }} - {{ article.price }}€</h2>
          <p>{{ article.description }}</p>
          <div>
            <button class="delete" @click="deleteArticle(article.id)">Supprimer</button>
            <button class="modify" @click="editArticle(article)">Modifier</button>
            <button class="remove-basket" v-if="isInPanier(article.id)" @click="removeFromPanier(article.id)">Retirer du panier</button>
            <button class="add-basket" v-else="isInPanier(article.id)" @click="addToPanier(article.id)">Ajouter au panier</button>
          </div>
        </div>
      </div>
      <div class="article-content" v-else>
        <div class="article-title">
          <h2><input type="text" v-model="editingArticle.name"> - <input type="number" v-model="editingArticle.price"></h2>
          <div>
            <button class="add-basket" @click="sendEditArticle()">Valider</button>
            <button class="delete" @click="abortEditArticle()">Annuler</button>
          </div>
        </div>
        <p><textarea v-model="editingArticle.description"></textarea></p>
        <input type="text" v-model="editingArticle.image" placeholder="Lien vers l'image">
      </div>
    </article>
    <form @submit.prevent="addArticle">
      <h2>Nouveau produit à ajouter</h2>
      <input class="title" type="text" v-model="newArticle.name" placeholder="Nom du produit" required>
      <input type="number" v-model="newArticle.price" placeholder="Prix" required>
      <textarea type="text" v-model="newArticle.description" required></textarea>
      <input type="text" v-model="newArticle.image" placeholder="Lien vers l'image">
      <button class="add-basket" type="submit">Ajouter</button>
    </form>
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
      newArticle: {
        name: '',
        description: '',
        image: '',
        price: 0
      },
      editingArticle: {
        id: -1,
        name: '',
        description: '',
        image: '',
        price: 0
      }
    }
  },
  methods: {
    addArticle() {
      this.$emit('add-article', this.newArticle)
    },
    deleteArticle(articleId) {
      this.$emit('delete-article', articleId)
    },
    addToPanier(articleId) {
      this.$emit('add-to-panier', articleId)
    },
    removeFromPanier(articleId) {
      this.$emit('remove-from-panier', articleId)
    },
    editArticle(article) {
      this.editingArticle.id = article.id
      this.editingArticle.name = article.name
      this.editingArticle.description = article.description
      this.editingArticle.image = article.image
      this.editingArticle.price = article.price
    },
    sendEditArticle() {
      this.$emit('update-article', this.editingArticle)
      this.abortEditArticle()
    },
    abortEditArticle() {
      this.editingArticle = {
        id: -1,
        name: '',
        description: '',
        image: '',
        price: 0
      }
    },
    isInPanier(articleId) {
      return this.panier.articles.some(a => a.id === articleId)
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
  margin-bottom: 10px;
}

button {
  padding: 7.5px 10px;
  border-radius: 10px;
  border: none;
}

input {
  border-radius: 5px;
}

form {
  background-color: orange;
  border-radius: 25px;
  padding: 25px;
}

.delete {
  background-color: lightcoral;
}

.modify {
  background-color: lightskyblue;
}

.add-basket {
  background-color: lightgreen;
}

.remove-basket {
  background-color: black;
  color: white;
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
  margin-bottom: 10px;
}

.article {
  padding: 25px;
  border-radius: 25px;
  background: #ffffff;
  box-shadow:  20px 20px 60px #d9d9d9,
              -20px -20px 60px #ffffff;
}

.title {
  color: black;
}

button {
  font-size: .8em;
}

textarea {
  width: 100%;
  border-radius: 5px;
  margin: 5px 0;
}
</style>
