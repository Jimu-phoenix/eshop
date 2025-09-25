-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2025 at 10:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` char(20) NOT NULL,
  `des` char(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` char(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `des`, `price`, `image`) VALUES
(1, 'Wireless Bluetooth H', 'High-quality wireless headphones with noise cancellation', 129.99, 'headphones.jpg'),
(4, 'Smart Watch edi 10', 'Fitness tracker with heart rate monitor', 199.99, 'smartwatch.jpg'),
(5, 'Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 29.99, 'mouse.jpg'),
(6, 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 79.99, 'keyboard.jpg'),
(7, 'Portable Speaker', 'Waterproof Bluetooth speaker with 20W output', 89.99, 'speaker.jpg'),
(8, 'Tablet Mini', '8-inch tablet with HD display and stylus support', 349.99, 'tablet.jpg'),
(9, 'Gaming Monitor', '27-inch 144Hz gaming monitor with 1ms response', 399.99, 'monitor.jpg'),
(10, 'External Hard Drive', '2TB portable hard drive with USB-C connectivity', 89.99, 'harddrive.jpg'),
(11, 'Air Pods 2', 'A 20,000 mAh power bank', 65000.00, '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
