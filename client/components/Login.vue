<template>
  <div class="login">
    <div class="in-login" v-if="user === null">
      <form @submit.prevent="submit">
        <h1>Se connecter</h1>
        <input type="email" v-model="email" placeholder="E-mail" required>
        <input type="password" v-model="password" placeholder="Mot de passe" required>
        <button class="validate" type="submit">Se connecter</button>
      </form>
    </div>
    <div v-else>
      <h1>Bienvenue !</h1>
        <p>{{user.email}}</p>
        <button @click="logout()">Se déconnecter</button>
    </div>
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
      email: '',
      password: ''
    }
  },
  methods: {
    submit() {
      this.$emit('login', { email: this.email, password: this.password })
    },
    logout() {
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
h1 {
  text-align: center;
  width: 100%;
  margin-bottom: 25px;
}

button {
  padding: 7.5px 10px;
  border-radius: 10px;
  border: none;
}

input {
  flex-grow: 1;
  flex-basis: 100%;
  border-radius: 25px;
  background: #ffffff;
  box-shadow:  20px 20px 60px #d9d9d9,
              -20px -20px 60px #ffffff;
  margin-bottom: 25px;
  font-size: 1em;
  padding: 0 15px;
}

form {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 400px;
}

.login {
  display: flex;
  justify-content: center;
}

.in-login {
  display: flex;
  padding: 25px;
  border-radius: 25px;
  background: #ffffff;
  box-shadow:  20px 20px 60px #d9d9d9,
              -20px -20px 60px #ffffff;
}

.validate {
  background-color: lightgreen;
}

.mismatch {
  border-color: red;
}
</style>
