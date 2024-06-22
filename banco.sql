-- Active: 1719089674359@@localhost@3306@banco
CREATE DATABASE IF NOT EXISTS banco;

USE banco;

CREATE TABLE clientes(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sobrenome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    cep VARCHAR(255) NOT NULL
);
CREATE TABLE Propriedade (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Valor FLOAT,
    Cliente_ID VARCHAR(255),
    Corretor_Id VARCHAR(255),
    Rua VARCHAR(255),
    Numero INT,
    Bairro VARCHAR(255),
    Cidade VARCHAR(255),
    Estado VARCHAR(255),
    Pais VARCHAR(255),
    CEP VARCHAR(255),
    Tipo VARCHAR(255),
    Area_m2 FLOAT,
    Disponibilidade VARCHAR(255)
);
