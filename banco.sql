CREATE DATABASE IF NOT EXISTS banco;

USE banco;

CREATE TABLE cliente(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sobrenome VARCHAR(255) NOT NULL,
    cpf VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    cep VARCHAR(255) NOT NULL
);

CREATE TABLE venda(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    propriedade_id INTEGER NOT NULL,
    dono_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    corretor_id INTEGER NOT NULL,
    valor FLOAT NOT NULL,
    forma_pagamento VARCHAR(255) NOT NULL,
    qtd_parcelas INTEGER NOT NULL
);

CREATE TABLE corretor(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(70) NOT NULL,
    cpf VARCHAR(15) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(80) NOT NULL,
    localidade VARCHAR(255) NOT NULL
);

CREATE TABLE propriedade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor FLOAT,
    cliente_id VARCHAR(255),
    corretor_id VARCHAR(255),
    rua VARCHAR(255),
    numero INT,
    bairro VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(255),
    pais VARCHAR(255),
    cep VARCHAR(255),
    tipo VARCHAR(255),
    area_m2 FLOAT,
    disponibilidade VARCHAR(255)
);

