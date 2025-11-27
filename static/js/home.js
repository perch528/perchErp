// 全局配置
const config = {
    apiUrl: '/api/'
};

// 页面初始化函数
function initPage() {
    initDateFields();
    loadStatisticsData();
    // loadStockStatusData();
    initEventListeners();
}

// 初始化日期字段
function initDateFields() {
    const today = new Date().toISOString().split('T')[0];
    $('#in-date').val(today);
    $('#out-date').val(today);
}

// 加载统计数据
function loadStatisticsData() {
    $.get(config.apiUrl + 'statistics', function(data) {
        console.log('加载统计数据:', data);
        $('#total-stock').text(data[0]);
        $('#stock-in').text(data[1]);
        $('#stock-out').text(data[2]);
    }).fail(function() {
        console.error('获取总库存数据失败');
    });
}

// 加载库存状态数据并初始化图表
function loadStockStatusData() {
    $.get(config.apiUrl + 'stockStatus', function(data) {
        // 更新状态数字
        $('#normal').text(data[0]);
        $('#low').text(data[1]);
        $('#outOf').text(data[2]);
        
        // 初始化图表
        initStockStatusChart(data);
    }).fail(function() {
        console.error('获取库存状态数据失败');
    });
}

// 初始化库存状态图表
function initStockStatusChart(data) {
    const ctx = document.getElementById('stockStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['正常库存', '低库存', '缺货'],
            datasets: [{
                data: data,
                backgroundColor: [
                    '#10b981', // success
                    '#f59e0b', // warning
                    '#ef4444'  // danger
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} 件`;
                        }
                    }
                }
            }
        }
    });
}

// 初始化所有事件监听器
function initEventListeners() {
    initTabSwitchListeners();
    initStockInModalListeners();
    initStockOutModalListeners();
    initFormSubmitListeners();
    initItemTemplateListeners();
}

// 初始化标签切换监听器
function initTabSwitchListeners() {
    $('#tab-inbound').click(function() {
        $('#tab-inbound').addClass('tab-active');
        $('#tab-outbound').removeClass('tab-active').addClass('border-transparent text-gray-500');
        $('#inbound-history').removeClass('hidden');
        $('#outbound-history').addClass('hidden');
    });
    
    $('#tab-outbound').click(function() {
        $('#tab-outbound').addClass('tab-active');
        $('#tab-inbound').removeClass('tab-active').addClass('border-transparent text-gray-500');
        $('#outbound-history').removeClass('hidden');
        $('#inbound-history').addClass('hidden');
    });
    
    $('#tab-stock-list').click(function() {
        $('#tab-stock-list').addClass('tab-active');
        $('#tab-item-templates').removeClass('tab-active').addClass('border-transparent text-gray-500');
        $('#stock-list-content').removeClass('hidden');
        $('#item-templates-content').addClass('hidden');
    });
    
    $('#tab-item-templates').click(function() {
        $('#tab-item-templates').addClass('tab-active');
        $('#tab-stock-list').removeClass('tab-active').addClass('border-transparent text-gray-500');
        $('#item-templates-content').removeClass('hidden');
        $('#stock-list-content').addClass('hidden');
    });
}

// 初始化入库模态框相关监听器
function initStockInModalListeners() {
    // 打开入库模态框
    $('#open-stock-in').click(openStockInModal);
    
    // 关闭入库模态框的各种方式
    $('#close-stock-in, #cancel-stock-in, #stock-in-modal .bg-gray-500').click(closeStockInModal);
    
    // 阻止模态框内部点击事件冒泡
    $('#stock-in-content').click(function(e) {
        e.stopPropagation();
    });
}

// 初始化出库模态框相关监听器
function initStockOutModalListeners() {
    // 打开出库模态框
    $('#open-stock-out').click(openStockOutModal);
    
    // 关闭出库模态框的各种方式
    $('#close-stock-out, #cancel-stock-out, #stock-out-modal .bg-gray-500').click(closeStockOutModal);
    
    // 阻止模态框内部点击事件冒泡
    $('#stock-out-content').click(function(e) {
        e.stopPropagation();
    });
}

// 初始化物品模板相关监听器
function initItemTemplateListeners() {
    // 打开物品模板模态框的各种按钮
    $('#open-item-template, #open-item-template-from-list').click(openItemTemplateModal);
    
    // 关闭物品模板模态框的各种方式
    $('#close-item-template, #cancel-item-template, #item-template-modal .bg-gray-500').click(closeItemTemplateModal);
    
    // 阻止模态框内部点击事件冒泡
    $('#item-template-content').click(function(e) {
        e.stopPropagation();
    });
}

// 初始化表单提交监听器
function initFormSubmitListeners() {
    $('#submit-stock-in').click(submitStockIn);
    $('#submit-stock-out').click(submitStockOut);
    $('#submit-item-template').click(submitItemTemplate);
}

// 打开入库模态框
function openStockInModal() {
    $('#stock-in-modal').removeClass('hidden');
    setTimeout(() => {
        $('#stock-in-content').removeClass('scale-95 opacity-0').addClass('scale-100 opacity-100');
    }, 10);
}

// 关闭入库模态框
function closeStockInModal() {
    $('#stock-in-content').removeClass('scale-100 opacity-100').addClass('scale-95 opacity-0');
    setTimeout(() => {
        $('#stock-in-modal').addClass('hidden');
    }, 200);
}

// 打开出库模态框
function openStockOutModal() {
    $('#stock-out-modal').removeClass('hidden');
    setTimeout(() => {
        $('#stock-out-content').removeClass('scale-95 opacity-0').addClass('scale-100 opacity-100');
    }, 10);
}

// 关闭出库模态框
function closeStockOutModal() {
    $('#stock-out-content').removeClass('scale-100 opacity-100').addClass('scale-95 opacity-0');
    setTimeout(() => {
        $('#stock-out-modal').addClass('hidden');
    }, 200);
}

// 打开物品模板模态框
function openItemTemplateModal() {
    $('#item-template-modal').removeClass('hidden');
    setTimeout(() => {
        $('#item-template-content').removeClass('scale-95 opacity-0').addClass('scale-100 opacity-100');
    }, 10);
}

// 关闭物品模板模态框
function closeItemTemplateModal() {
    $('#item-template-content').removeClass('scale-100 opacity-100').addClass('scale-95 opacity-0');
    setTimeout(() => {
        $('#item-template-modal').addClass('hidden');
    }, 200);
}
//获取模板数据加载到下拉框
function loadTemplateOptions() {
    $.get(config.apiUrl + 'getTemplate', function(template_data) {
        console.log('加载物品模板数据:', template_data);
        // 清空现有选项
        $('#in-product, #out-product').empty();
        // 添加默认选项
        $('#in-product').append('<option value="error" disabled selected>选择物品</option>');
        // 遍历模板数据并添加到下拉框
        template_data.forEach(function(item) {
            const option = `<option value="${item.item_name}">${item.item_name}</option>`;
            $('#in-product, #out-product').append(option);
        });
    }).fail(function() {
        console.error('获取物品模板数据失败');
    });
}

// 提交入库操作
function submitStockIn() {
    // 简单验证
    
    const product = $('#in-product').val();
    const quantity = $('#in-quantity').val();
    const operator = $('#in-operator').val();
    const supplier = $('#in-supplier').val();
    const remark = $('#in-remark').val();

    if (!product || !quantity || quantity < 1 || !operator || !supplier || !remark) {
        alert('请填写所有必填字段并确保数量有效');
        return;
    }
    // 获取计数单位
    $.get(config.apiUrl + 'getCountingUnit', {product:product},function(data) {
        console.log('getcu获取计数单位:', data.counting_unit);
        // 这里会发送post请求到服务器
        $.post(config.apiUrl + 'setItemsStock', {
            product: product,
            quantity: parseInt(quantity),  // 确保是整数类型
            countingUnit: data.counting_unit, // 使用获取的计数单位
            supplier: supplier,
            operator: operator,
            date: $('#in-date').val(),
            remark: remark
        }, function(response) {
            console.log(response.message);
            console.log(response.message);
            alert('入库操作已完成！' + product + ' ' + quantity + '件'); // 移到这里
            closeStockInModal();
            getStockIn(); 
            getStockInRecord(); // 获取入库记录
            $('#stock-in-form')[0].reset(); // 重置表单
            loadStatisticsData(); // 重新加载统计数据
            // loadStockStatusData(); // 重新加载库存状态数据
        }).fail(function(xhr) {
            console.error('入库操作失败:', xhr.responseJSON);
            alert('入库失败: ' + (xhr.responseJSON?.detail || '未知错误'));
        });
    }).fail(function() {
        console.error('获取计数单位失败');
    });
    
}
function getStockIn(){
   $.get(config.apiUrl + 'getItemsStock', function(data) {

        // 清空现有表格内容
        $('#stock-list-content tbody').empty();
        // 遍历数据并添加到表格
        console.log('处理库数据:', data);
        data.forEach(function(item) {
            switch (item.items_warning) {
                case '1':
                    items_status_warning = '<span class="bg-red-600 text-white px-4 py-0.5 rounded-full">缺货</span>';
                    break;
                case '2':
                    items_status_warning = '<span class="bg-yellow-600 text-white px-4 py-0.5 rounded-full">低库存</span>';
                    break;
                case '3':
                    items_status_warning = '<span class="bg-green-600 text-white px-4 py-0.5 rounded-full">正常库存</span>';
                    break;
                default:
                    items_status_warning = '未知状态';
                    break;
            }
            console.log('处理入库项:', item);
            const row = `<tr>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.items_id}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.items_name}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.count}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.counting_unit}</td>
                <td class="px-50 py-3 text-center text-xs font-medium uppercase tracking-wider">${items_status_warning}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.remark}</td>
            </tr>`;
            $('#stock-list-content tbody').append(row);
        });
        // 显示入库记录表格
        $('#stock-list-content').removeClass('hidden');
    }).fail(function() {
        console.error('获取库记录失败');
    });

}
// 提交出库操作
function submitStockOut() {
    // 简单验证
    const product = $('#out-product').val();
    const quantity = $('#out-quantity').val();
    const operator = $('#out-operator').val();
    
    if (!product || !quantity || quantity < 1 || !operator) {
        alert('请填写所有必填字段并确保数量有效');
        return;
    }

    $.post(config.apiUrl + 'outItemsStock', {
        product: product,
        quantity: parseInt(quantity),  // 确保是整数类型
        useTo: $('#out-purpose').val(),
        operator: operator,
        date: $('#out-date').val()
    }, function(response) {
        console.log(response.message);
        alert('出库操作已完成！' + product + ' ' + quantity + '件'); // 移到这里
        closeStockOutModal();
        getStockIn(); // 重新获取入库记录数据以更新表格
        getStockOutRecord(); // 获取出库记录
        $('#stock-out-form')[0].reset(); // 重置表单
        loadStatisticsData(); // 重新加载统计数据
        // loadStockStatusData(); // 重新加载库存状态数据
    }).fail(function(xhr) {
        
        console.error('出库操作失败:', xhr.responseJSON);
        alert('出库失败: ' + (xhr.responseJSON?.detail || '未知错误'));
    });
    closeStockOutModal();
}

// 提交物品模板表单
function submitItemTemplate() {
    // 验证必填字段
    const name = $('#template-name').val().trim();
    const unit = $('#template-unit').val().trim();
    const minStock = $('#template-min-stock').val().trim();
    const remark = $('#template-remark').val().trim();
    
    if (!name || !unit || minStock === '' || minStock < 0 || !remark) {
        alert('请填写所有必填字段并确保最低库存预警为有效数值');
        return;
    }
    
    // 使用键值对形式组织数据
    const formData = {
        name: name,
        unit: unit,
        min_stock: parseInt(minStock),  // 确保是整数类型
        remark: remark
    };
    
    $.post(config.apiUrl + 'setTemplate', formData, function(response) {
        console.log(response.message);
        alert('物品模板创建成功！');
        closeItemTemplateModal();
    })
    .fail(function(xhr) {
        console.error('创建物品模板失败:', xhr.responseJSON);
        alert('创建失败: ' + (xhr.responseJSON?.detail || '未知错误'));
    });
    // alert('物品模板创建成功！');
    closeItemTemplateModal();
    getTemplate(); // 重新获取物品模板数据以更新表格
    $('#item-template-form')[0].reset(); // 重置表单
}
// 获取物品模板信息
function getTemplate() {
    
    $.get(config.apiUrl + 'getTemplate', function(template_data) {

        // 清空现有表格内容
        $('#template-list').empty();
        // 遍历模板数据并添加到表格
        template_data.forEach(function(item) {
            console.log('处理物品模板项:', item);
            const row = `<tr>
                <td>${item.id}</td>
                <td>${item.item_name}</td>
                <td>${item.counting_unit}</td>
                <td>${item.stock_warning_line}</td>
                <td>${item.description}</td>
                <!-- 删除按钮 -->
                <td>
                    <button onclick="deleteTemplate(${item.id})" class="group relative bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-5 rounded-lg shadow-md shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 active:translate-y-0 active:bg-red-700">
                    <i class="fa fa-trash mr-2 group-hover:scale-110 transition-transform"></i>
                        <span>删除</span>
                        <span class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                            确认删除
                        </span>
                    </button>
                </td>
            </tr>`;
            $('#template-list').append(row);
        });
        // 显示物品模板表格
        $('#template-list').removeClass('hidden');
        // 同时更新入库和出库的物品下拉框选项
        loadTemplateOptions();
    }).fail(function() {
        console.error('获取物品模板数据失败');
    });
    
}
// 删除物品模板
function deleteTemplate(id) {
    if (!confirm('确定要删除此物品模板吗？')) {
        return;
    }
    $.post(config.apiUrl + 'deleteTemplate', {id:id}, function(response) {
        console.log(response.message);
        alert('物品模板删除成功！');
        getTemplate(); // 重新获取物品模板数据以更新表格
    }).fail(function(xhr) {
        console.error('删除物品模板失败:', xhr.responseJSON);
        alert('删除失败: ' + (xhr.responseJSON?.detail || '未知错误'));
    });

}

function getStockInRecord(){
    $.get(config.apiUrl + 'getStockInRecord', function(data) {
        // 清空现有表格内容
        $('#stock-in-record tbody').empty();
        // 遍历数据并添加到表格
        data.forEach(function(item) {
            // stock_in_id, item_name, count, provider, handler, in_date
            console.log('处理入库记录项1:', item);
            
            const row = `<tr>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.stock_in_id}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.item_name}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.count}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.provider}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.handler}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.in_date}</td>
            </tr>`;
            console.log('添加入库记录行1:', row);
            
            $('#stock-in-record tbody').append(row);
        });
        // 显示入库记录表格
        $('#stock-in-record').removeClass('hidden');
    }).fail(function() {
        console.error('获取入库记录失败');
    });
}

function getStockOutRecord(){
    $.get(config.apiUrl + 'getStockOutRecord', function(data) {
        // 清空现有表格内容
        $('#stock-out-record tbody').empty();
        // 遍历数据并添加到表格
        data.forEach(function(item) {
            // stock_out_id, item_name, count, use_to, handler, out_date
            console.log('处理出库记录项:', item);
            const row = `<tr>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.stock_out_id}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.item_name}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.count}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.use_to}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.handler}</td>
                <td class="px-6 py-3 text-left text-ls font-medium uppercase tracking-wider">${item.out_date}</td>
            </tr>`;
            $('#stock-out-record tbody').append(row);
        });
        // 显示出库记录表格
        $('#stock-out-record').removeClass('hidden');
    }).fail(function() {
        console.error('获取出库记录失败');
    });
}
// 文档加载完成后初始化页面
$(document).ready(function() {
    initPage();
    getStockInRecord(); // 获取入库记录
    getTemplate(); // 获取物品模板数据
    getStockIn(); // 重新获取入库记录数据以更新表格
    getStockOutRecord(); // 获取出库记录
});