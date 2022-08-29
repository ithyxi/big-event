$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage
    // 定义一个查询的参数对象 将来请求数据的时候 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1,//页码值
        pagesize: 2,//每页显示多少条数据
        cate_id: '',//文章分类的 Id
        state: ''//文章的状态，可选值有：已发布、草稿
    }
    initTable()
    initCate()
    // 获取文章的列表数据
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                // layer.msg('获取文章列表成功！')
                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                // console.log(res);
                renderPage(res.total)//渲染分页的方法
            }
        })
    }

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date()

        const y = dt.getFullYear()
        const m = paraZero(dt.getMonth() + 1)
        const d = paraZero(dt.getDate())

        const hh = paraZero(dt.getHours())
        const mm = paraZero(dt.getMinutes())
        const ss = paraZero(dt.getSeconds())

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }
    // 定义补0函数
    function paraZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 初始化 文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类列表失败！')
                }
                //调用模板引擎 渲染分类的可选项
                var htmlStr = template('tap-cate', res)
                $('[name=cate_id]').html(htmlStr)
                // 通过layui 重新渲染表单区域的UI结构
                form.render()
            }
        })
    }

    // 为筛选表单 绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取表单中 选中 的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 为查询 参数对象q 中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
        // 根据最新筛选条件 重新渲染表格的数据
        initTable()
    })


    // 定义 渲染分页的方法
    function renderPage(total) {
        // console.log(total);
        laypage.render({
            elem: 'pageBox', //注意，这里的 pageBox 是 ID，不用加 # 号   分页的容器
            count: total,//数据总数，从服务端得到
            limit: q.pagesize,//每页显示几条数据
            curr: q.pagenum,//设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页发生切换的时候  触发jump回调
            // 触发jump回调的方式有两种：1 点击页码的时候 会触发jump回调 2 只要调用了  laypage.render()方法 就会触发jump回调
            jump: function (obj, first) {
                // console.log(first)
                // 如果first的值为true 证明是方式2触发的--- 否则就是方式1触发的
                // console.log(obj.curr)
                // 把最新的页码值 赋值到 q这个查询参数对象中
                q.pagenum = obj.curr
                // 把最新的条目数 赋值到q这个查询参数对象的pagesize属性中
                q.pagesize = obj.limit
                if (!first) {
                    // 根据最新的q 获取对应的数据列表 并渲染表格
                    initTable()
                }
            }

        })
    }

    // 删除文章
    $('tbody').on('click', ' #btnDelete', function () {
        var len = $('#btnDelete').length
        console.log(len)
        var id = $(this).attr('data-id')
        layer.confirm('确定删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')
                    // 当数据删除完成后 需要判断当前这一页中 是否还有剩余的数据 
                    // 如果没有剩余的数据了 则让页码值-1之后
                    // 再重新调用 initTable方法
                    if (len === 1) {
                        // 如果 len 的值等于1  证明删除完毕之后    页面上就没有任何数据了
                        // 页码值最小必须是1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index);
        });
    })
})