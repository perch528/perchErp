import mysql.connector
from mysql.connector import Error


def get_db_connection():
    """创建并返回数据库连接"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='erpdb',
            user='root',
            password='123456'
        )
        return connection if connection.is_connected() else None
    except Error as e:
        print(f"数据库连接错误: {e}")
        return None


def check_credentials_exist(username, password):
    connection = get_db_connection()
    if not connection:
        return False

    try:
        with connection.cursor() as cursor:
            query = "SELECT 1 FROM users WHERE username = %s AND password = %s LIMIT 1"
            cursor.execute(query, (username, password))
            return cursor.fetchone() is not None
    except Error as e:
        print(f"查询错误: {e}")
        return False
    finally:
        if connection.is_connected():
            connection.close()

def manager_stock(mode,item_class):
    
    connection = get_db_connection()
    if not connection:
        return None
    try:
        with connection.cursor() as cursor:
            # 插入一条记录

            if mode == "in":
                in_value = item_class.quantity
                set_in_stock(item_class)
                # id, total_stock, today_in, today_out, record_date
                print(f"item_class.quantity: {item_class.__dict__}")
                query = '''
                UPDATE statistics 
                SET total_stock = (SELECT SUM(count) FROM items_stock), today_in = today_in + %s, record_date = CURDATE()
                WHERE id = 1
                '''
                cursor.execute(query,(in_value,))
                connection.commit()
            else:
                out_value = item_class.quantity
                out_items_stock(item_class)
                query = '''
                UPDATE statistics
                SET total_stock = (SELECT SUM(count) FROM items_stock), today_out = today_out + %s, record_date = CURDATE()
                WHERE id = 1
                '''
                cursor.execute(query,(out_value,))
                connection.commit()
            print(f"成功更新统计记录，受影响的行数: {cursor.rowcount}")
            return True
        

    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def get_statistics():
    connection = get_db_connection()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            query = "SELECT total_stock, today_in, today_out FROM statistics LIMIT 1"
            cursor.execute(query)
            row = cursor.fetchone()
            return row if row else None
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

# 这个是负责缺货少,三色圆饼图,里面的参数到时候需要修改
def get_stock_status():
    connection = get_db_connection()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            query = "SELECT total_items, total_stock, today_in, today_out FROM statistics LIMIT 1"
            cursor.execute(query)
            row = cursor.fetchone()
            return row if row else None
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def set_template(setTemplateVar):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
             # 插入一条记录
            insert_query = '''
            INSERT INTO items_template VALUES (%s, %s, %s, %s, %s)
            '''
            data = (None,setTemplateVar[0], setTemplateVar[1], setTemplateVar[2], setTemplateVar[3])
            cursor.execute(insert_query, data)
            
            # 提交事务
            connection.commit()
            print(f"成功插入记录，新记录ID: {cursor.lastrowid}")
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def get_template():
    connection = get_db_connection()
    if not connection:
        return None

    try:
        # 使用字典游标，使查询结果以字典形式返回
        with connection.cursor(dictionary=True) as cursor:
            # 查询表中所有数据
            sql = f"SELECT * FROM items_template"
            cursor.execute(sql)
            
            # 获取所有记录
            all_rows = cursor.fetchall()
            print(f"成功获取 {len(all_rows)} 条记录")
            return all_rows
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def delete_template(template_id):
    connection = get_db_connection()
    if not connection:
        return None
    try:
        with connection.cursor() as cursor:
            # 删除指定ID的记录
            delete_query = "DELETE FROM items_template WHERE id = %s"
            cursor.execute(delete_query, (template_id,))
            connection.commit()
            print(f"成功删除记录，受影响的行数: {cursor.rowcount}")
    except Error as e:
        print(f"删除错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def set_in_stock(inStockVar):
    connection = get_db_connection()
    if not connection:
        return None
    try:
        with connection.cursor() as cursor:
            # 插入一条记录
            # 查询是否存在相同的产品
            check_query = "SELECT items_id,count FROM items_stock WHERE items_name = %s"
            cursor.execute(check_query, (inStockVar.product,))
            existing_record = cursor.fetchone()
            print(f"查询到的现有记录: {existing_record}")
            # 如果存在相同的产品，更新记录；如果不存在，插入新记录
            if existing_record:
                # 如果存在，更新记录
                update_query = '''
                UPDATE items_stock 
                SET count = %s, remark = %s 
                WHERE items_id = %s
                '''
                inStockVar.quantity += existing_record[1]
                data = (inStockVar.quantity, inStockVar.remark, existing_record[0])
                cursor.execute(update_query, data)
                print(f"成功更新记录，受影响的行数: {cursor.rowcount}")
            else:
                # 如果不存在，插入新记录
                insert_query = '''
                INSERT INTO items_stock (items_id, items_name, count, counting_unit, items_warning, remark) 
                VALUES (%s, %s, %s, %s, %s, %s)
                '''
                data = (None, inStockVar.product, inStockVar.quantity, inStockVar.countingUnit, 1, inStockVar.remark)
                cursor.execute(insert_query, data)
                print(f"成功插入记录，新记录ID: {cursor.lastrowid}")
            # 提交事务
            insert_in_record = '''
            INSERT INTO stock_in (stock_in_id, item_name, count, provider, handler, in_date)
            VALUES (%s, %s, %s, %s, %s, %s)
            '''
            cursor.execute(insert_in_record, (None, inStockVar.product, inStockVar.quantity, inStockVar.supplier, inStockVar.operator, inStockVar.date))
            connection.commit()
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def get_in_stock():
    connection = get_db_connection()
    if not connection:
        return None
    try:
        # 使用字典游标，使查询结果以字典形式返回
        with connection.cursor(dictionary=True) as cursor:
            # 查询表中所有数据
            sql = f"SELECT * FROM items_stock"
            cursor.execute(sql)
            # 获取所有记录
            all_rows = cursor.fetchall()
            print(f"成功获取 {len(all_rows)} 条记录")
            return all_rows
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def get_counting_unit(product):
    connection = get_db_connection()
    if not connection:
        return None
    try:
        with connection.cursor() as cursor:
            # 查询计数单位
            sql = "SELECT counting_unit FROM items_template WHERE item_name=%s"
            cursor.execute(sql, (product,))
            result = cursor.fetchone()
            if result:
                return result[0]
            else:
                print("未找到计数单位")
                return None
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def get_stock_in_record():
    connection = get_db_connection()
    if not connection:
        return None
    try:
        # 使用字典游标，使查询结果以字典形式返回
        with connection.cursor(dictionary=True) as cursor:
            # 查询入库记录
            sql = f"SELECT * FROM stock_in"
            cursor.execute(sql)
            # 获取所有记录
            all_rows = cursor.fetchall()
            print(f"成功获取 {len(all_rows)} 条入库记录")
            return all_rows
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()

def out_items_stock(outStockVar):
    connection = get_db_connection()
    if not connection:
        return None
    try:
        with connection.cursor() as cursor:
            # 查询当前库存
            check_query = "SELECT items_id, count FROM items_stock WHERE items_name = %s"
            cursor.execute(check_query, (outStockVar.product,))
            existing_record = cursor.fetchone()
            print(f"查询到的现有记录: {existing_record}")
            if existing_record and existing_record[1] >= outStockVar.quantity:
                # 如果库存足够，更新库存
                new_quantity = existing_record[1] - outStockVar.quantity
                update_query = '''
                UPDATE items_stock 
                SET count = %s 
                WHERE items_id = %s
                '''
                data = (new_quantity, existing_record[0])
                cursor.execute(update_query, data)
                print(f"成功更新记录，受影响的行数: {cursor.rowcount}")
                
                # 记录出库信息
                insert_out_record = '''
                INSERT INTO stock_out (stock_out_id, item_name, count, use_to, handler, out_date)
                VALUES (%s, %s, %s, %s, %s, %s)
                '''
                cursor.execute(insert_out_record, (None, outStockVar.product, outStockVar.quantity, outStockVar.useTo, outStockVar.operator, outStockVar.date))
                
                # 提交事务
                connection.commit()
                return True
            else:
                print("库存不足或未找到该产品")
                return False
    except Error as e:
        print(f"查询错误: {e}")
        return False
    finally:
        if connection.is_connected():
            connection.close()

def get_stock_out_record():
    connection = get_db_connection()
    if not connection:
        return None
    try:
        # 使用字典游标，使查询结果以字典形式返回
        with connection.cursor(dictionary=True) as cursor:
            # 查询出库记录
            sql = f"SELECT * FROM stock_out"
            cursor.execute(sql)
            # 获取所有记录
            all_rows = cursor.fetchall()
            print(f"成功获取 {len(all_rows)} 条出库记录")
            return all_rows
    except Error as e:
        print(f"查询错误: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()


if __name__ == "__main__":
    print(get_template())
    print(type(get_template()))

