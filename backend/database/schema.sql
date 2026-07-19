CREATE DATABASE IF NOT EXISTS tadung06_db CHARACTER SET utf8mb4;
USE tadung06_db;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    dana_account VARCHAR(20),
    balance DECIMAL(15,2) DEFAULT 0,
    status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal', 'win', 'loss') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_type ENUM('GAME_OFF', 'GAME_ON_COIN', 'GAME_ON_BEBAS') NOT NULL,
    bet_amount DECIMAL(15,2) DEFAULT 0,
    win_amount DECIMAL(15,2) DEFAULT 0,
    status ENUM('ongoing', 'completed') DEFAULT 'ongoing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (username, email, password, full_name, status) VALUES 
('admin', 'admin@tadung06.com', '$2b$10$YOu6iCdKmFXCrFpVfD0pPuXyHoJknQKBvKZBhEeWmqHIVEVCx0FVO', 'Admin Tadung06', 'active');