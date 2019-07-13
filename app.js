var path = require("path");
var Datastore = require("nedb");
var express = require("express");
var app = express();
var hbs = require("express-handlebars");
var url = require("url");
var bodyParser = require("body-parser");
var formidable = require("formidable");
var cookieParser = require("cookie-parser");

const PAGINATION = 3;
const PORT = 80;
const admin = true;

var skip = 0;
var curr = null;

var db = new Datastore({
    filename: './database/main.db',
    autoload: true
});

var dbb = new Datastore({
    filename: './database/bought.db',
    autoload: true
});

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.set("views", path.join(__dirname, "views"));
app.engine("hbs", hbs({
    defaultLayout: "main.hbs",
    helpers: {
        currency(a) {
            return a + " zł";
        }
    }
}));
app.set("view engine", "hbs");

app.get("/", (req, res) => {
    if (req.cookies.admin)
        res.render("index.hbs", { admin });
    else
        res.render("index.hbs");

})

app.get("/search", (req, res) => {
    curr = req.query.title;
    if (!req.query.criterium)
        res.redirect("/searchWithout")
    else
        res.redirect(url.format({
            pathname: "/searchWith",
            query: req.query
        }))
})

app.get("/clear", (req, res) => {
    curr = req.query.title;
    skip = 0;
    if (!req.query.criterium)
        res.redirect("/searchWithout");
    else
        res.redirect(url.format({
            pathname: "/searchWith",
            query: req.query
        }))
})

app.get("/searchWithout", (req, res) => {
    let reg = new RegExp(curr, "i");
    db.find({ title: { $regex: reg } }).skip(skip * PAGINATION).limit(PAGINATION).exec((err, docs) => {
            res.render("results.hbs", { docs , admin: req.cookies.admin });
    })
})

app.get("/searchWith", (req, res) => {
    let reg = new RegExp(curr, "i");
    db.find({ title: { $regex: reg } }).sort({ [req.query.criterium]: req.query.sort }).skip(skip * PAGINATION).limit(PAGINATION).exec((err, docs) => {
        res.render("results.hbs", { docs, crit:  req.query, admin: req.cookies.admin })
    })
})

app.get("/changeDir", (req, res) => {
    if (req.query.dir == "plus")
        skip++;
    else if (skip)
        skip--;
    res.redirect(url.format({
        pathname: "/search",
        query: {
            title: curr,
            criterium: req.query.criterium,
            sort: req.query.sort
        }
    }));
})

app.get("/browse", (req, res) => {
    db.find({}).skip(skip * PAGINATION).limit(PAGINATION).exec((err, docs) => {
        res.render("results.hbs", { docs })
    });
})

app.get("/login", (req, res) => {
    if(req.cookies.admin)
        res.redirect("/");
    else
        res.render("login.hbs");
})

app.get("/logoff", (req, res) => {
    res.clearCookie("admin");
    res.redirect('/');
})

app.get("/admin", (req, res) => {
    if (req.cookies.admin)
        res.render("admin.hbs");
    else
        res.redirect("/");
})

app.get("/user", (req, res) => {
    if (!req.cookies.admin)
        res.render("user.hbs");
    else
        res.redirect("/");
})

app.get("/add", (req, res) => {
    if (req.cookies.admin)
        res.render("add.hbs");
    else
        res.redirect("/");
})

app.get("/item/:id", (req, res) => {
    db.findOne({ id: req.params.id }, (err, doc) => {
        if(req.cookies.admin)
            res.render("profile.hbs", {doc, admin});
        else
            res.render("profile.hbs", {doc});
    })
})

app.get("/edit", (req, res) => {
    db.update({id: req.query.id}, {$set: req.query}, {}, err => {
        res.redirect("/search");
    })
})

app.get("/buy", (req, res) => {
    if(!Object.keys(req.query).length)
        res.render("card.hbs", {msg: "Musisz wybrać produkt"})
    else
    {
        let a = [];
        let wrn = [];
        dbb.find({}, (err, docs) => {
            for(let el in docs)
                a.push(docs[el].title);
            let card = Array.isArray(req.query.title) ? req.query.title : Array(req.query.title);
            for(let el of card) {
                if(!(a.includes(el)))
                    dbb.insert({title: el});
                else
                    wrn.push(el);
            }
            dbb.find({}, (err, docs) => {
                res.render("card.hbs", {docs, wrn});
            })
        })
    }
})

app.post("/handleAdd", (req, res) => {
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = __dirname + '/static/upload/';
    form.parse(req, function (err, fields, files) {
        db.find({}, (err, docs) => {
            let arr = [];
            let num = 0;
            if(docs)
                for(let doc of docs)
                    arr.push(doc.id);
            while(true) {
                if(!arr.includes(num.toString()))
                    break;
                else 
                    num++;
            }
            let obj = fields;
            obj.id = num.toString();
            obj.src = files.imagetoupload.path.split("\\").slice(files.imagetoupload.path.split("\\").length - 2).join("\\");
            db.insert(obj, (err, doc) => {
                res.render("add.hbs", { err, doc });
            })
        })
    });
})

app.get("/delete/:id", (req, res) => {
    db.remove({id: req.params.id}, {}, (err, num) => {
        res.redirect("/search");
    });

})

app.post("/loginHandler", (req, res) => {
    if (req.body.login == "admin" && req.body.passwd == "admin") {
        res.cookie("admin", "true", {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
            httpOnly: true
        })
        res.redirect('/');
    }
    else
        res.render("login.hbs", { msg: "Zły login lub hasło" });
})

app.listen(PORT, () => console.log("Zahostowano na porcie " + PORT))