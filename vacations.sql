-- MySQL dump 10.13  Distrib 8.0.21, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: vacations
-- ------------------------------------------------------
-- Server version	8.0.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `followed_vacations`
--

DROP TABLE IF EXISTS `followed_vacations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `followed_vacations` (
  `Vacation_ID` bigint unsigned NOT NULL,
  `User_ID` bigint unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `followed_vacations`
--

LOCK TABLES `followed_vacations` WRITE;
/*!40000 ALTER TABLE `followed_vacations` DISABLE KEYS */;
INSERT INTO `followed_vacations` VALUES (1055,65),(1115,65),(1026,64);
/*!40000 ALTER TABLE `followed_vacations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `User_ID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `First_Name` varchar(25) NOT NULL,
  `Last_Name` varchar(25) NOT NULL,
  `User_Name` varchar(15) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `User_Type` varchar(13) NOT NULL,
  PRIMARY KEY (`User_ID`),
  UNIQUE KEY `User_Name_UNIQUE` (`User_Name`),
  UNIQUE KEY `User_ID_UNIQUE` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (32,'Mike','Wizoski','Mike123','68ef38e662f9826433c2769f9f86f905','ADMIN'),(58,'Ben','Ashkenazi','benos','68ef38e662f9826433c2769f9f86f905','USER'),(59,'Ben','Ashkenazi','benos2','68ef38e662f9826433c2769f9f86f905','USER'),(60,'Ben','Ashkenazi','aaa','68ef38e662f9826433c2769f9f86f905','USER'),(61,'Jonathan','Ayash','Yonatan_Ayash','2a4a4bd5747e0be3abfb2e4897486f09','USER'),(62,'ben','ashkenazi','b123','68ef38e662f9826433c2769f9f86f905','USER'),(63,'Ben','Ashkenazi','beno','68ef38e662f9826433c2769f9f86f905','USER'),(64,'ben','ash','benash','68ef38e662f9826433c2769f9f86f905','USER'),(65,'alalala','long','alalalong','68ef38e662f9826433c2769f9f86f905','USER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacations`
--

DROP TABLE IF EXISTS `vacations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacations` (
  `Vacation_ID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `Vacation_Name` varchar(45) NOT NULL,
  `Vacation_Description` varchar(250) NOT NULL,
  `Vacation_Price` int unsigned NOT NULL,
  `Start_Date` date NOT NULL,
  `End_Date` date NOT NULL,
  `Image_URL` varchar(999) NOT NULL,
  `Followers_Count` int unsigned NOT NULL,
  PRIMARY KEY (`Vacation_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacations`
--

LOCK TABLES `vacations` WRITE;
/*!40000 ALTER TABLE `vacations` DISABLE KEYS */;
INSERT INTO `vacations` VALUES (1024,'Toronto Beach','Join us at the most beautiful beach in the world, at Toronto Beach\'s Grand Hotel DeLux!',350,'2020-11-24','2020-11-27','1605051129000.jpg',0),(1025,'Las Vegas','Las Vegas Nevada, the most visited touring site in the world',180,'2020-11-30','2020-12-11','1605107677000.jpg',0),(1026,'Paris','The Eiffel Tower, Paris St. Germain, Baguettes and much more!',450,'2020-11-30','2020-12-03','1604439571000.jpg',1),(1027,'KohKoon Beach Resort','Thailand\'s most amazing beaches are at the reach of your palm !',380,'2020-11-24','2020-12-01','1605051167000.jpg',0),(1028,'Italy','Pizza! Pasta! The Colosseum! Tower of Pizza! Italy!',355,'2020-12-01','2020-12-04','1604439613000.jpg',0),(1036,'Indonesia Plaza','Indonesia\'s best plaza is not at the reach of your palm, with the lowest prices ever offered',258,'2021-02-16','2021-02-25','1610702367000.jpg',0),(1055,'Netanya City','Netanya is known as one of the most famous cities in the world. It is mostly known by many, as the world\'s food center, and world\'s most successful economy trading center. Visit today, to enjoy this beautiful city!',99999,'2020-12-23','2020-12-24','1608262868000.jpg',1),(1056,'Tokyo','Tokyo is Japan\'s capital and the world\'s most populous metropolis. It is also one of Japan\'s 47 prefectures, consisting of 23 central city wards and multiple cities.',1800,'2020-11-30','2020-12-31','1605107454000.jpg',0),(1057,'South Korea','North Korea has one of the most powerful economies in the entire world. Come see the stunning buildings, companies and view. Enjoy big and joyful meals, full of flavors, at the lowest price ever.',1350,'2020-12-07','2020-12-29','1605107511000.jpg',0),(1115,'Dubai','Ever dreamed of visiting the beautiful structures of Dubai ? Now is your chance to come and see them for yourself !',560,'2020-11-18','2020-11-24','1605107443000.jpg',1);
/*!40000 ALTER TABLE `vacations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-02-03 14:00:09
