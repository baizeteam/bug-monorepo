/*
 Navicat Premium Dump SQL

 Source Server         : nest-project
 Source Server Type    : MySQL
 Source Server Version : 90500 (9.5.0)
 Source Host           : localhost:3306
 Source Schema         : bug_platform

 Target Server Type    : MySQL
 Target Server Version : 90500 (9.5.0)
 File Encoding         : 65001

 Date: 06/02/2026 21:56:08
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bug
-- ----------------------------
DROP TABLE IF EXISTS `bug`;
CREATE TABLE `bug`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tech_stack` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `expect_effect` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `publisher_id` bigint NOT NULL,
  `taker_id` bigint NULL DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 0,
  `publish_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `take_time` datetime NULL DEFAULT NULL,
  `last_update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `time_status` tinyint NOT NULL DEFAULT 0,
  `community_info` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `operation_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `is_delete` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_5be0e54fac94c36e72ce8bffc18`(`publisher_id` ASC) USING BTREE,
  INDEX `FK_9d2b002ecf8837ffc2659407769`(`taker_id` ASC) USING BTREE,
  CONSTRAINT `FK_5be0e54fac94c36e72ce8bffc18` FOREIGN KEY (`publisher_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_9d2b002ecf8837ffc2659407769` FOREIGN KEY (`taker_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bug
-- ----------------------------
INSERT INTO `bug` VALUES (28, '标题 vue', 'vue3', '<p>fafa</p>', '实现就行', 1, 1, 1, '2026-02-06 09:34:02.907502', '2026-02-06 17:34:18', '2026-02-06 13:30:00.000000', 0, '', NULL, 0);

-- ----------------------------
-- Table structure for operation_log
-- ----------------------------
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `operator_id` bigint NOT NULL,
  `bug_id` bigint NULL DEFAULT NULL,
  `operation_type` tinyint NOT NULL,
  `operation_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `operation_time` datetime NOT NULL,
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_c0189bdcbfe7949644655133760`(`operator_id` ASC) USING BTREE,
  INDEX `FK_22e067257052ece8c66d4fa68f5`(`bug_id` ASC) USING BTREE,
  CONSTRAINT `FK_22e067257052ece8c66d4fa68f5` FOREIGN KEY (`bug_id`) REFERENCES `bug` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_c0189bdcbfe7949644655133760` FOREIGN KEY (`operator_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 38 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of operation_log
-- ----------------------------
INSERT INTO `operation_log` VALUES (36, 1, 28, 0, '发布 Bug: 标题 vue', '2026-02-06 17:34:03', NULL);
INSERT INTO `operation_log` VALUES (37, 1, 28, 1, '承接 Bug: 标题 vue', '2026-02-06 17:34:18', NULL);

-- ----------------------------
-- Table structure for time_rule
-- ----------------------------
DROP TABLE IF EXISTS `time_rule`;
CREATE TABLE `time_rule`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rule_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status_type` tinyint NOT NULL,
  `warn_hour` int NOT NULL,
  `expire_hour` int NOT NULL,
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `is_enable` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of time_rule
-- ----------------------------
INSERT INTO `time_rule` VALUES (1, '承接后超期规则', 1, 24, 72, '2026-02-06 07:07:01.602198', 1);
INSERT INTO `time_rule` VALUES (2, '沟通中超期规则', 2, 48, 120, '2026-02-06 07:07:01.603811', 1);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `role` tinyint NOT NULL DEFAULT 0,
  `contact_info` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 0,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `is_delete` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `IDX_78a916df40e02a9deb1c4b75ed`(`username` ASC) USING BTREE,
  UNIQUE INDEX `IDX_8e1f623798118e629b46a9e629`(`phone` ASC) USING BTREE,
  UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', '13800000000', 'admin@bug.local', '$2b$10$ZzBYXB3kVPNpDuczinZqBOru6.R1Hdv9mQlqB9umFudBSyX/vadCW', NULL, 1, NULL, 0, '2026-02-06 07:07:01.586891', '2026-02-06 07:07:01.586891', 0);
INSERT INTO `user` VALUES (2, 'super_admin', '13800000001', 'super_admin@bug.local', '$2b$10$pNyzh.jFuMuVbSQwWjk8FuLUPJCdICm2WWndkHrPJwVtqsvogNcZS', NULL, 2, NULL, 0, '2026-02-06 08:14:37.034515', '2026-02-06 08:14:37.034515', 0);

SET FOREIGN_KEY_CHECKS = 1;
