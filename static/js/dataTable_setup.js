$(document).ready( function () {
    $('#patientList').DataTable({
        "language": {
            "paginate": {
                "sNext": "下一页",
                "sPrevious": "上一页",
            },
            "loadingRecords": "正在加载中.....",
            "zeroRecords": "对不起，查询不到相关数据！",
            "infoFiltered": "【从 _MAX_ 条数据中搜索的结果】",
            "sSearch": "搜索",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
        },
    });

    $('#allPatient').DataTable({
        "serverSide": false,
        "dom": "Bfrtip",
        "buttons": [{
                "extend": "excelHtml5",
                "filename": "全部病人",
        }],
        "language": {
            "paginate": {
                "sNext": "下一页",
                "sPrevious": "上一页",
            },
            "loadingRecords": "正在加载中.....",
            "zeroRecords": "对不起，查询不到相关数据！",
            "infoFiltered": "【从 _MAX_ 条数据中搜索的结果】",
            "sSearch": "搜索",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
        },
    });

    $('#allRecord').DataTable({
        "serverSide": false,
        "dom": "Bfrtip",
        "buttons": [{
                "extend": "excelHtml5",
                "filename": "全部记录",
        }],
        "language": {
            "paginate": {
                "sNext": "下一页",
                "sPrevious": "上一页",
            },
            "loadingRecords": "正在加载中.....",
            "zeroRecords": "对不起，查询不到相关数据！",
            "infoFiltered": "【从 _MAX_ 条数据中搜索的结果】",
            "sSearch": "搜索",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
        },
    });

    $('#allCourse').DataTable({
        "language": {
            "paginate": {
                "sNext": "下一页",
                "sPrevious": "上一页",
            },
            "loadingRecords": "正在加载中.....",
            "zeroRecords": "对不起，查询不到相关数据！",
            "infoFiltered": "【从 _MAX_ 条数据中搜索的结果】",
            "sSearch": "搜索",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
        }
    });
});
