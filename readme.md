# 简介

基于typescript compiler api为minits做预处理(typescript==>minits)

  以实现类的构造函数预处理为例

  ## input

  ```
    class Employee {
        empCode: number;
        empName: string;
    
        constructor(empCode: number, empName: string) {
        this.empCode = empCode;
        this.empName = empName;
        }
    
        say() {
        console.log("Hello, %s!\n", this.empName)
        }
    }
    
    function main(): number {
        const a = new Employee(42, "Mohanson"), b = new Employee(2,'Hu')
        const c = new Employee(112,'Wu')
        a.say(); // Employee_say(a)
        return a.empCode;
    }

  ```

  ## output

  ```
  class Employee {
    empCode: number;
    empName: string;
    constructor(empCode: number, empName: string) {
        this.empCode = empCode;
        this.empName = empName;
    }
    say() {
        console.log("Hello, %s!\n", this.empName);
    }
  }
  function Employee_constructor(_this: Employee, empCode: number, empName: string): void {
      _this.empCode = empCode;
      _this.empName = empName;
  }
  function main(): number {
      const a = new Employee(42, "Mohanson"), b = new Employee(2, "Hu"), d = 1;
      Employee_constructor(b, 2, "Hu")
      const c = new Employee(112, "Wu");
      Employee_constructor(c, 112, "Wu")
      Employee_constructor(new Employee(234, "aaaaaaaa"), 234, "aaaaaaaa");
      a.say(); // Employee_say(a)
      return a.empCode;
  }
  ```

# 安装运行

```
 yarn
 yarn start

```

# 参考
1. [typescript Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API-(TypeScript-1.4))
2. [ts ast生成器](https://ts-ast-viewer.com/)
3. [官方 ts transform](https://github.com/microsoft/TypeScript/blob/master/src/compiler/transformers/)
