var foo = {
    bar:function () {
        return this.baz
    },
    baz:1
}

function name() {
    console.log(arguments[0])
}

name(foo.bar);