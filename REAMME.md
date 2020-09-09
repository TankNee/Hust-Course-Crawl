## HUST COURSE CRAWLER

---

华中科技大学课程系统爬虫

需要的参数：

1. Cookie

    - 需要cookie来通过身份验证，没有使用hust-pass组件，所以烦请各位从 [课程表](https://pass.hust.edu.cn/cas/login?service=http%3A%2F%2Fhub.m.hust.edu.cn%2Fkcb%2Findex.jsp%3Fv%3D1#qdate_section
        )的网页获取你的Cookie，在Request Header中

        > 按F12就可以打开开发者工具
        >
        > 打开Network标签页
        >
        > 找到XHR类型的请求
        >
        > 随便找一个请求，点开找到他的Request Header
        >
        > 复制Request Header中的Cookie项

    - 用复制出来的值填入脚本

2. 学期的开始日期

    - 格式为 YYYY-MM-DD
    - 例如 `2020-08-31`

3. 学期总共的周次数

    - 例如本学期为19周，那么就是19

使用方法

1. 修改脚本

2. cli方式

    ```
    // TODO
    ```

    

