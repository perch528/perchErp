from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Form, Request, Query
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import os
import socket
import uvicorn
from pydantic import BaseModel
import erp_database as ed

app = FastAPI()

# 定义静态文件目录
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    favicon_path = os.path.join(STATIC_DIR, "favicon.svg")
    if not os.path.exists(favicon_path):
        return {"error": "Favicon不存在"}
    return FileResponse(favicon_path)
# 根路径重定向到登录页
@app.get("/")
async def root():
    return RedirectResponse(url="/login", status_code=303)

# 登录页面（GET请求）
@app.get("/login")
async def get_login_page():
    login_path = os.path.join(STATIC_DIR, "login.html")
    if not os.path.exists(login_path):
        return {"error": "登录页面不存在"}
    return FileResponse(login_path)

# 处理登录提交（POST请求）
@app.post("/login")
async def post_login(username: str = Form(), password: str = Form()):
    # 验证凭据
    if ed.check_credentials_exist(username, password):
        # 登录成功，重定向到首页（使用303状态码确保后续是GET请求）
        return RedirectResponse(url="/home", status_code=303)
    else:
        # 登录失败，重定向回登录页并附带错误信息
        return RedirectResponse(url="/error", status_code=303)
@app.get("/js/home.js")
async def get_home_js():
    js_path = os.path.join(STATIC_DIR, "js", "home.js")
    if not os.path.exists(js_path):
        return {"error": "JavaScript文件不存在"}
    return FileResponse(js_path)
# 首页（仅允许已登录用户访问）
@app.get("/home")
async def get_home_page():
    home_path = os.path.join(STATIC_DIR, "home.html")
    if not os.path.exists(home_path):
        return {"error": "首页不存在"}
    return FileResponse(home_path)

@app.get("/error")
async def get_error_page():
    error_path = os.path.join(STATIC_DIR, "error.html")
    if not os.path.exists(error_path):
        return {"error": "错误"}
    return FileResponse(error_path)


@app.get("/api/statistics")
async def get_statistics():
    """获取库存统计数据"""
    statistics_data = ed.get_statistics()
    return statistics_data

@app.get("/api/stockStatus")
async def get_stock_status():
    """获取库存状态数据"""
    stock_status_row = ed.get_stock_status()
    return stock_status_row


@app.post("/api/setTemplate")
async def set_template(
    name: str = Form(),
    unit: str = Form(),
    min_stock: int = Form(),
    remark: str = Form()
):
    # 将接收的字段组合成列表
    setTemplateVar = [name, unit, min_stock, remark]
    ed.set_template(setTemplateVar)
    return {"message": "物品模板创建成功"}
@app.get("/api/getTemplate")
async def get_template():
    """获取物品模板数据"""
    template_data = ed.get_template()
    return template_data

@app.post("/api/deleteTemplate")
async def delete_template(id: int = Form()):
    """删除物品模板"""
    ed.delete_template(id)
    return {"message": "物品模板删除成功"}

class StockInformation():
    def __init__(self, product, quantity, countingUnit, supplier, useTo, operator, date, remark):
        self.product = product
        self.quantity = quantity
        self.countingUnit = countingUnit
        self.supplier = supplier
        self.useTo = useTo
        self.operator = operator
        self.date = date
        self.remark = remark
    
    def __del__(self):
        self.product = 0
        self.quantity = 0
        self.countingUnit = 0
        self.supplier = 0
        self.useTo = 0
        self.operator = 0
        self.date = 0
        self.remark = 0
        pass

@app.post("/api/setItemsStock")
async def in_stock(
    product: str = Form(),
    quantity: int = Form(),
    countingUnit: str = Form(),
    supplier: str = Form(),
    operator: str = Form(),
    date: str = Form(),
    remark: str = Form()
):

    # 将接收的字段组合成
    inStockVar = StockInformation(product, quantity, countingUnit, supplier, None, operator, date, remark)
    print(f"main接收到入库信息: {inStockVar.__dict__}")
    # 调用数据库操作函数

    ed.manager_stock('in', inStockVar)
    return {"message": "入库操作成功"}

@app.get("/api/getItemsStock")
async def get_in_stock():
    """获取入库数据"""
    in_stock_data = ed.get_in_stock()
    return in_stock_data

@app.get("/api/getCountingUnit")
async def get_counting_unit(product: str):
    """获取计数单位"""
    print(f"main获取计数单位: {product}")
    counting_unit = ed.get_counting_unit(product)
    print(f"main返回计数单位: {counting_unit}")
    return {"counting_unit": counting_unit}

@app.get("/api/getStockInRecord")
async def get_stock_in_record():
    """获取入库记录"""
    stock_in_record = ed.get_stock_in_record()
    return stock_in_record

@app.post("/api/outItemsStock")
async def out_items_stock(
    product: str = Form(),
    quantity: int = Form(),
    useTo: str = Form(),
    operator: str = Form(),
    date: str = Form()
):
    """处理出库请求"""
    outStockVar = StockInformation(product, quantity, None, None, useTo, operator, date, None)
    print(f"main接收到出库信息: {outStockVar.__dict__}")
    ed.manager_stock('out', outStockVar)
    return {"message": "出库操作成功"}

@app.get("/api/getStockOutRecord")
async def get_stock_out_record():
    """获取出库记录"""
    stock_out_record = ed.get_stock_out_record()
    return stock_out_record
if __name__ == "__main__":
    ip = socket.gethostbyname(socket.gethostname())
    print(f"服务器运行在: http://{ip}:8000")
    print(f"静态文件目录: {STATIC_DIR}")
    uvicorn.run(app, host=ip, port=8000)
