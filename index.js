const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')

const app = express();
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get("/home", (req,res) => {
    res.status(200).render("home");
});

app.get("/cliente", (req,res) => {
    res.status(200).render("cliente");
    
});

app.get("/corretor", (req,res) => {
    res.status(200).render("corretor");
    
});

app.get("/anunciar-imovel", (req,res) => {
    res.status(200).render("propriedade");
    
});

console.log("Hello");

app.listen(3000, () => {
    console.log("Servidor executado na porta 3000");
});