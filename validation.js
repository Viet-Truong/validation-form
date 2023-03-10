function Validation(options) {
    // option la` cac key cua 1 obj o file html
    // lay ra cai form de dung` 
    var formElement = document.querySelector(options.form);
    // bien selectorRules dung` de luu cac rule lai 
    var selectorRules = {}
    function getParentElement(element, selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    // ham thuc hien validate
    function Validate(element, rule) {
        // lay ra the p hien thi thong tin loi
        var errorElement = getParentElement(element, options.formGroupSelector).querySelector(options.errorSelector);
        // rule dc thuc thi
        var error;
        // lay ra cac rule cua selector
        var rules = selectorRules[rule.selector]
        // loop qua tung rule va kiem tra neu co loi thi` dung viec ktra
        for (var i = 0; i < rules.length; i++) {
            switch(element.type) {
                case 'radio':
                case 'checkbox':      
                    error = rules[i](
                        // rule.selector chinh la` css selector chinh la` input[name = "gender"] or la #fullname
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    error = rules[i](element.value)
            }
            if(error) break;
        }
        if (error) {
            errorElement.parentElement.classList.add('invalid')
            errorElement.innerHTML = error
        }else{
            errorElement.parentElement.classList.remove('invalid')
            errorElement.innerHTML = ''
        }
        return !error
    }
    // xu li su kien
    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isFormValid = true
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = Validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }
            })
            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    // select tat ca cac field attributes la name va k co attibute la` disabled
                    var formEnableInput = formElement.querySelectorAll('input[name]:not([disabled])')
                    var formValue = Array.from(formEnableInput).reduce(function (value, input) {
                        // value[input.name] chinh la` 1 key cua obj formValue
                        switch(input.type){
                            case 'file': 
                                value[input.name] = input.files
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    value[input.name] = ""
                                    return value
                                }
                                if(!Array.isArray(value[input.name])) {
                                    value[input.name] = []
                                }
                                value[input.name].push()
                                break;
                            case 'radio':
                                value[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            default:
                                value[input.name] = input.value
                        }
                        return value
                    }, {})
                    options.onSubmit(formValue)
                }
            }
        }
        options.rules.forEach(function (rule) {
            // save rule cho moi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            } else{
                selectorRules[rule.selector] = [rule.test]
            }
            // lap qua tat ca cac rule va lang nghe su kien cua cac rule
            var inputElements = formElement.querySelectorAll(rule.selector); // all la` vi` vd nhu checkbox hay radio se bi trung css selector => phai lay tat ca cac phan tu
            Array.from(inputElements).forEach(inputElement => {
                inputElement.onblur = function () {
                     // value: inputElement.value
                     // test(): rule.test
                     // .parentElement: lấy ra được thằng cha của element
                    Validate(inputElement, rule)
                }
                // xu li khi nguoi dung nhap vao input
                inputElement.oninput = function (){
                    var errorElement = getParentElement(inputElement, options.formGroupSelector).querySelector('.message');
                    errorElement.innerHTML = ''
                    getParentElement(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}



// Dinh nghia cac Rules
Validation.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || "Trường này là bắt buộc"
        }
    }
}

Validation.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return emailRegex.test(value) ? undefined : message || "Giá trị nhập vào không chính xác"
        }
    }
}

Validation.isPassword = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/
            return passwordRegex.test(value) ? undefined : `Mật khẩu phải có từ 8 kí tự trở lên và có 1 chữ cái`
        }
    }
}

Validation.checkConfirmPassword = function(selector, password, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === password() ? undefined : message || "Giá trị nhập vào không chính xác"
        }
    }
}