$(function () {
    var form = layui.form
    var layer = layui.layer
    form.verify = ({
        nickname: function (value) {
            if (value.length < 6) {
                return '昵称长度必须在1-6个字符之间!'
            }
        }
    })
    // 调用 初始化用户的基本信息 函数 
    initUserInfo()

    // 初始化用户的基本信息
    function initUserInfo() {
        $.ajax({
            method: 'GET',
            url: '/my/userinfo',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取用户信息失败！')
                }
                // console.log(res)
                form.val('formUserInfo', res.data)
            }

        })
    }
    // 重置表单数据
    $('#btnReset').on('click', function (e) {
        e.preventDefault()
        //初始化用户的基本信息
        initUserInfo()
    })

    // 监听表单的提交事件
    $('.layui-form').on('submit', function (e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/my/userinfo',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更新用户信息失败！')
                }
                layer.msg('修改用户信息成功！')
                // console.log(res);
                // //调用父页面的方法 重新渲染用户头像和用户信息---
                // 1.$(function())会形成局部作用域，
                // 2.我们声明函数时，最好把其他页面也需要用到的函数 声明在全局作用域中 以便 子页面 调用
                window.parent.getUserInfo()
            }
        })

    })
})