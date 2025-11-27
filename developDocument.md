# Perch ErpWeb
## Program language
### Front-end
HTML + Tailwind CSS + Font Awesome + JQuery
### Back-end
python + Fastapi + Mysql Connector Python
### Database
Mysql
### Server
uvicorn
## 数据库的数据表设计，预计设计7个数据表分别为(人员表、总计表、物品模板表、库存状态表、库存表、入库记录表、出库记录表)
### 人员数据表
设定最大权级为1

|ID|账号|密码|权限级别|所属部门|
|--|--|--|--|--|
|001|zhb|zhb123|2|企划部|
|002|lwz|lwz123|3|仓储部|
```mysql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    department VARCHAR(100) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### 总计数据表
```mysql
create table statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_stock int NOT NULL,
    today_in int NOT NULL,
    today_out int NOT NULL,
    record_date date
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 物品模板表
|ID|名称|计数单位|缺货界限|描述|
|--|--|--|--|--|
|001|机床|台|4|通用机床|
|002|模具|个|6|通用铸造模具|
```mysql
CREATE TABLE items_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(60) NOT NULL,
    counting_unit VARCHAR(20) NOT NULL,
    stock_warning_line int not null,
    description VARCHAR(150) not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 库存状态表
```mysql
create table status(
    id int AUTO_INCREMENT PRIMARY KEY,
    normal int not null,
    low int not null,
    out_of int not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### 库存表
此版本的库存表取消因跨表寻找会徒增后端服务器压力
```mysql
create table items_stock(
    items_id int AUTO_INCREMENT PRIMARY KEY,
    items_template_id int not null,
    count int not null,
    items_warning enum('1','2','3') not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
#### 新版本
```mysql
create table items_stock(
    items_id int AUTO_INCREMENT PRIMARY KEY,
    items_name varchar(100) not null,
    count int not null,
    counting_unit varchar(20) not null,
    items_warning enum('1','2','3') not null,
    remark varchar(150) not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### 入库记录表
```mysql
create table stock_in(
    stock_in_id int AUTO_INCREMENT PRIMARY KEY,
    item_name varchar(100) not null,
    count int not null,
    provider varchar(150) not null,
    handler varchar(50) not null,
    in_date date not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### 出库记录表
```mysql
create table stock_out(
    stock_out_id int AUTO_INCREMENT PRIMARY KEY,
    item_name varchar(100) not null,
    count int not null,
    use_to varchar(150) not null,
    handler varchar(50) not null,
    out_date date not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```