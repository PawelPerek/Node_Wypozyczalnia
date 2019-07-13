$(document).ready(() => {
    $("p").hover(function () {
        $(this).animate({
            opacity: 1
        }, 200)
        $(this).parent().children(".cardimg").animate({
            opacity: 0
        }, 200)
    }, function () {
        $(this).animate({
            opacity: 0
        }, 200)
        $(this).parent().children(".cardimg").animate({
            opacity: 1
        }, 200)
    });
})

class Cookie {
    static add(name, value) {
        document.cookie = name + "=" + value + ";expires=" + (new Date(Date.now() + 1000 * 60 * 60 * 30 * 24 * 12 * 2)).toUTCString();
    }
    static valueOf(name) {
        for (let el = 0; el < document.cookie.split("; ").length; el++) {
            if (document.cookie.split("; ") [el].split("=") [0] == name)
                return document.cookie.split(";") [el].split("=") [1];
        }
        return null;
    }
    static delete(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}

Number.random = range => Math.floor(Math.random() * range);

Array.prototype.remove = function (el1, el2) {
    return this.splice(el1, 1)[0];
};

Array.prototype.is = function(testArr) {
    if(this.length != testArr.length)
        return false;
    for(let i in range(testArr.length)) {
        if(this[i] != testArr[i])
            return false;
    }
    return true;
}

Array.prototype.randomize= function() {
    let arr= [];
    while(this.length)
        arr.push(this.remove(Math.random()* 180701% this.length));
    for(let i= 0; i< arr.length; i++)
        this.push(arr[i]);
    return this;
};

function range (t, r, e) {
    if(!r) [r, t] = [t, 0]
    if (e || (e = 1), d = [], t < r) 
        for (var o = t; o < r; o += e)
            d.push(o); 
    else 
        for (var n = t; n > r; n -= e)
            d.push(n); 
    return d; 
}