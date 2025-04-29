document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const mealForm = document.getElementById('mealForm');
    const mealsTableBody = document.getElementById('mealsTableBody');
    const totalAmountElement = document.getElementById('totalAmount');
    const editIdInput = document.getElementById('editId');
    const formTitle = document.getElementById('formTitle');
    const submitText = document.getElementById('submitText');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const printBtn = document.getElementById('printBtn');
    const searchInput = document.getElementById('searchInput');
    
    // بيانات الوجبات
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    let isEditing = false;

    // أحداث الصفحة
    initEvents();
    renderMealsTable();

    // تهيئة الأحداث
    function initEvents() {
        // إضافة/تعديل وجبة
        mealForm.addEventListener('submit', handleFormSubmit);
        
        // إلغاء التعديل
        cancelEditBtn.addEventListener('click', cancelEdit);
        
        // طباعة السجل
        printBtn.addEventListener('click', printRecords);
        
        // البحث
        searchInput.addEventListener('input', searchMeals);
    }

    // معالجة إرسال النموذج
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const mealData = {
            id: isEditing ? parseInt(editIdInput.value) : Date.now(),
            name: document.getElementById('mealName').value,
            price: parseFloat(document.getElementById('mealPrice').value),
            quantity: parseInt(document.getElementById('mealQuantity').value),
            date: document.getElementById('orderDate').value,
            addedAt: new Date().toISOString()
        };
        
        if (isEditing) {
            // تحديث الوجبة الموجودة
            const index = meals.findIndex(meal => meal.id === mealData.id);
            if (index !== -1) {
                meals[index] = mealData;
                showAlert('تم تحديث الوجبة بنجاح', 'success');
            }
        } else {
            // إضافة وجبة جديدة
            meals.push(mealData);
            showAlert('تم إضافة الوجبة بنجاح', 'success');
        }
        
        saveToLocalStorage();
        renderMealsTable();
        resetForm();
    }

    // عرض الوجبات في الجدول
    function renderMealsTable(filteredMeals = null) {
        const mealsToRender = filteredMeals || meals;
        
        if (mealsToRender.length === 0) {
            mealsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <i class="fas fa-info-circle"></i> لا توجد وجبات مضافة
                    </td>
                </tr>
            `;
            totalAmountElement.textContent = '0.00 ريال';
            return;
        }
        
        // فرز الوجبات حسب تاريخ الإضافة (الأحدث أولاً)
        mealsToRender.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        
        let tableContent = '';
        let totalAmount = 0;
        
        mealsToRender.forEach((meal, index) => {
            const mealTotal = meal.price * meal.quantity;
            totalAmount += mealTotal;
            
            tableContent += `
                <tr data-id="${meal.id}">
                    <td>${index + 1}</td>
                    <td>${meal.name}</td>
                    <td>${meal.price.toFixed(2)} ريال</td>
                    <td>${meal.quantity}</td>
                    <td>${mealTotal.toFixed(2)} ريال</td>
                    <td>${formatDate(meal.date)}</td>
                    <td class="actions">
                        <button class="btn edit-btn" onclick="editMeal(${meal.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn delete-btn" onclick="deleteMeal(${meal.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        mealsTableBody.innerHTML = tableContent;
        totalAmountElement.textContent = `${totalAmount.toFixed(2)} ريال`;
    }

    // تعديل وجبة
    window.editMeal = function(id) {
        const meal = meals.find(meal => meal.id === id);
        if (meal) {
            isEditing = true;
            editIdInput.value = meal.id;
            document.getElementById('mealName').value = meal.name;
            document.getElementById('mealPrice').value = meal.price;
            document.getElementById('mealQuantity').value = meal.quantity;
            document.getElementById('orderDate').value = meal.date;
            
            formTitle.textContent = 'تعديل الوجبة';
            submitText.textContent = 'تحديث';
            cancelEditBtn.style.display = 'inline-block';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // إلغاء التعديل
    function cancelEdit() {
        isEditing = false;
        resetForm();
    }

    // حذف وجبة
    window.deleteMeal = function(id) {
        if (confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
            meals = meals.filter(meal => meal.id !== id);
            saveToLocalStorage();
            renderMealsTable();
            showAlert('تم حذف الوجبة بنجاح', 'danger');
        }
    };

    // البحث عن وجبات
    function searchMeals() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            renderMealsTable();
            return;
        }
        
        const filteredMeals = meals.filter(meal => 
            meal.name.toLowerCase().includes(searchTerm) ||
            meal.price.toString().includes(searchTerm) ||
            meal.quantity.toString().includes(searchTerm) ||
            formatDate(meal.date).includes(searchTerm)
        );
        
        renderMealsTable(filteredMeals);
    }

    // طباعة السجل
    function printRecords() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <title>سجل وجبات المطعم</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #2c3e50; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: right; }
                    th { background-color: #2c3e50; color: white; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .total { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>سجل وجبات المطعم</h1>
                    <p>تاريخ الطباعة: ${formatDate(new Date().toISOString())}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم الوجبة</th>
                            <th>السعر</th>
                            <th>الكمية</th>
                            <th>المجموع</th>
                            <th>تاريخ الطلب</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generatePrintContent()}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4">الإجمالي العام</td>
                            <td class="total">${calculateTotal().toFixed(2)} ريال</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // توليد محتوى الطباعة
    function generatePrintContent() {
        return meals.map((meal, index) => {
            const mealTotal = meal.price * meal.quantity;
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${meal.name}</td>
                    <td>${meal.price.toFixed(2)} ريال</td>
                    <td>${meal.quantity}</td>
                    <td>${mealTotal.toFixed(2)} ريال</td>
                    <td>${formatDate(meal.date)}</td>
                </tr>
            `;
        }).join('');
    }

    // حساب الإجمالي
    function calculateTotal() {
        return meals.reduce((total, meal) => total + (meal.price * meal.quantity), 0);
    }

    // حفظ في localStorage
    function saveToLocalStorage() {
        localStorage.setItem('meals', JSON.stringify(meals));
    }

    // إعادة تعيين النموذج
    function resetForm() {
        mealForm.reset();
        editIdInput.value = '';
        isEditing = false;
        formTitle.textContent = 'إضافة وجبة جديدة';
        submitText.textContent = 'إضافة';
        cancelEditBtn.style.display = 'none';
    }

    // تنسيق التاريخ
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options);
    }

    // إظهار تنبيه
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="close-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});