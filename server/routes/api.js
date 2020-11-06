const express = require('express')
const bcrypt = require('bcrypt')
const { Client } = require('pg')
const router = express.Router()

const client = new Client({
  user: 'redacted',
  host: 'redacted',
  password: 'redacted',
  database: 'redacted'
})
client.connect()

class Panier {
  constructor() {
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.articles = []
  }
}

/**
 * Dans ce fichier, vous trouverez des exemples de requêtes GET, POST, PUT et DELETE
 * Ces requêtes concernent l'ajout ou la suppression d'articles sur le site
 * Votre objectif est, en apprenant des exemples de ce fichier, de créer l'API pour le panier de l'utilisateur
 *
 * Notre site ne contient pas d'authentification, ce qui n'est pas DU TOUT recommandé.
 * De même, les informations sont réinitialisées à chaque redémarrage du serveur, car nous n'avons pas de système de base de données pour faire persister les données
 */

/**
 * Notre mécanisme de sauvegarde des paniers des utilisateurs sera de simplement leur attribuer un panier grâce à req.session, sans authentification particulière
 */
router.use((req, res, next) => {
  // l'utilisateur n'est pas reconnu, lui attribuer un panier dans req.session
  if (typeof req.session.panier === 'undefined') {
    req.session.panier = new Panier()
  }
  next()
})

router.post('/register', async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  // vérification de la validité des données d'entrée
  if (typeof email !== 'string' || email === '' ||
      typeof password !== 'string' || password === '') {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const query = await client.query({
    text: "SELECT * FROM users WHERE email = $1 LIMIT 1",
    values: [email]
  })

  if (query.rows.length !== 0) {
    res.status(400).json({ message: 'email taken' })
    return
  }

  const hash = await bcrypt.hash(password, 10)

  await client.query({
    text: "INSERT INTO users (email, password) VALUES ($1, $2)",
    values: [email, hash]
  })

  res.send()
})

router.post('/login', async (req, res) => {
  if (req.session.userId !== undefined) {
    res.status(401).json({ message: 'already logged in' })
    return
  }

  const email = req.body.email
  const password = req.body.password

  // vérification de la validité des données d'entrée
  if (typeof email !== 'string' || email === '' ||
      typeof password !== 'string' || password === '') {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const query = await client.query({
    text: "SELECT * FROM users WHERE email = $1 LIMIT 1",
    values: [email]
  })

  if (query.rows.length === 0) {
    res.status(400).json({ message: 'incorrect credentials' })
    return
  }

  const user = query.rows[0]
  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    res.status(400).json({ message: 'incorrect credentials' })
    return
  }

  req.session.userId = user.id

  res.send()
})

router.post('/logout', async (req, res) => {
  if (req.session.userId === undefined) {
    res.status(401).json({ message: 'not logged in' })
    return
  }

  delete req.session.userId

  res.send()
})

router.get('/me', async (req, res) => {
  if (req.session.userId === undefined) {
    res.status(401).json({ message: 'not logged in' })
    return
  }

  const query = await client.query({
    text: "SELECT * FROM users WHERE id = $1 LIMIT 1",
    values: [req.session.userId]
  })

  if (query.rows.length === 0) {
    res.status(400).json({ message: 'user no longer existent' })
    return
  }

  const user = query.rows[0]

  res.json({
    id: user.id,
    email: user.email
  })
})

router.route('/panier')
  /*
   * Cette route doit retourner le panier de l'utilisateur, grâce à req.session
   */
  .get((req, res) => {
    res.json(req.session.panier)
  })

  /*
   * Cette route doit ajouter un article au panier, puis retourner le panier modifié à l'utilisateur
   * Le body doit contenir l'id de l'article, ainsi que la quantité voulue
   */
  .post(async (req, res) => {
    const id = parseInt(req.body.id)
    const quantity = parseInt(req.body.quantity)

    if (isNaN(id) || id <= 0 ||
      isNaN(quantity) || quantity <= 0 ||
      req.session.panier.articles.some(article => article.id === id)) {
      res.status(400).json({ message: 'bad request' })
      return
    }

    const query = await client.query({
      text: "SELECT * FROM articles WHERE id = $1 LIMIT 1",
      values: [id]
    })

    if (query.rows.length === 0) {
      res.status(404).json({ message: 'article ' + id + ' does not exist' })
      return
    }

    const item = {
      id,
      quantity
    }
    req.session.panier.articles.push(item)
    req.session.panier.updatedAt = new Date()

    res.send()
  })

/*
 * Cette route doit permettre de confirmer un panier, en recevant le nom et prénom de l'utilisateur
 * Le panier est ensuite supprimé grâce à req.session.destroy()
 */
router.post('/panier/pay', (req, res) => {
  if (req.session.userId === undefined) {
    res.status(401).json({ message: 'not logged in' })
    return
  }

  req.session.panier.articles.splice(0, req.session.panier.articles.length)
  req.session.panier.updatedAt = new Date()
  res.send()
})

function parsePanierArticle(req, res, next) {
  const articleId = parseInt(req.params.articleId)

  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
  req.articleId = articleId

  const article = req.session.panier.articles.find(article => article.id === req.articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
  req.article = article
  next()
}

router.route('/panier/:articleId')
  /*
   * Cette route doit permettre de changer la quantité d'un article dans le panier
   * Le body doit contenir la quantité voulue
   */
  .put(parsePanierArticle, (req, res) => {
    const quantity = parseInt(req.body.quantity)

    if (isNaN(quantity) || quantity <= 0) {
      res.status(400).json({ message: 'bad request' })
      return
    }

    req.article.quantity = quantity
    req.session.panier.updatedAt = new Date()

    res.send()
  })

  /*
   * Cette route doit supprimer un article dans le panier
   */
  .delete(parsePanierArticle, (req, res) => {
    const index = req.session.panier.articles.indexOf(req.article)
    req.session.panier.articles.splice(index, 1)
    req.session.panier.updatedAt = new Date()

    res.send()
  })


/**
 * Cette route envoie l'intégralité des articles du site
 */
router.get('/articles', async (req, res) => {
  const query = await client.query("SELECT * FROM articles")

  res.json(query.rows)
})

/**
 * Cette route crée un article.
 * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
 * NOTE: lorsqu'on redémarre le serveur, l'article ajouté disparait
 *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
 */
router.post('/article', async (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const image = req.body.image
  const price = parseInt(req.body.price)

  // vérification de la validité des données d'entrée
  if (typeof name !== 'string' || name === '' ||
      typeof description !== 'string' || description === '' ||
      typeof image !== 'string' || image === '' ||
      isNaN(price) || price <= 0) {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const query = await client.query({
    text: "INSERT INTO articles (name, description, image, price) VALUES ($1, $2, $3, $4) RETURNING id",
    values: [name, description, image, price]
  })

  const article = {
    id: query.rows[0].id,
    name,
    description,
    image,
    price
  }
  // on envoie l'article ajouté à l'utilisateur
  res.json(article)
})

/**
 * Cette fonction fait en sorte de valider que l'article demandé par l'utilisateur
 * est valide. Elle est appliquée aux routes:
 * - GET /article/:articleId
 * - PUT /article/:articleId
 * - DELETE /article/:articleId
 * Comme ces trois routes ont un comportement similaire, on regroupe leurs fonctionnalités communes dans un middleware
 */
async function parseArticle(req, res, next) {
  const articleId = parseInt(req.params.articleId)

  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
  req.articleId = articleId

  const query = await client.query({
    text: "SELECT * FROM articles WHERE id = $1 LIMIT 1",
    values: [req.articleId]
  })

  if (query.rows.length === 0) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
  req.article = query.rows[0]
  next()
}

router.route('/article/:articleId')
  /**
   * Cette route envoie un article particulier
   */
  .get(parseArticle, (req, res) => {
    // req.article existe grâce au middleware parseArticle
    res.json(req.article)
  })

  /**
   * Cette route modifie un article.
   * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
   * NOTE: lorsqu'on redémarre le serveur, la modification de l'article disparait
   *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
   */
  .put(parseArticle, async (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const image = req.body.image
    const price = parseInt(req.body.price)

    req.article.name = name
    req.article.description = description
    req.article.image = image
    req.article.price = price

    const query = await client.query({
      text: "UPDATE articles SET name = $1, description = $2, image = $3, price = $4 WHERE id = $5",
      values: [name, description, image, price, req.articleId]
    })
    res.send()
  })

  .delete(parseArticle, async (req, res) => {
    await client.query({
      text: "DELETE FROM articles WHERE id = $1",
      values: [req.articleId]
    }) // remove the article from the database
    res.send()
  })

module.exports = router
